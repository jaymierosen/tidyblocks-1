import {
  tbAssert,
  tbGet
} from "./tidyblocks"

/**
 * Store a dataframe.
 */
export class TidyBlocksDataFrame {

  /**
   * Construct a new dataframe.
   * @param {Object[]} values The initial values (aliased).
   */
  constructor (values) {
    this.data = values
  }

  //------------------------------------------------------------------------------

  /**
   * Filter rows, keeping those that pass a test.
   * @param {function} op How to test rows.
   * @returns A new dataframe.
   */
  filter (blockId, op) {
    tbAssert(op, `[block ${blockId}] no operator for filter`)
    const newData = this.data.filter(row => {
      return op(row)
    })
    return new TidyBlocksDataFrame(newData)
  }

  /**
   * Group by the values in a column, storing the result in a new _group_ column.
   * @param {string} column The column that determines groups.
   * @returns A new dataframe.
   */
  groupBy (blockId, column) {
    tbAssert(column.length !== 0,
             `[block ${blockId}] empty column name for grouping`)
    const seen = new Map()
    let groupId = 0
    const grouped = this.data.map(row => {
      row = {...row}
      const value = tbGet(blockId, row, column)
      if (! seen.has(value)) {
        seen.set(value, groupId)
        groupId += 1
      }
      row._group_ = seen.get(value)
      return row
    })
    return new TidyBlocksDataFrame(grouped)
  }

  /**
   * Create a new column by operating on existing columns.
   * @param {string} newName New column's name.
   * @param {function} op How to create new values from a row.
   * @returns A new dataframe.
   */
  mutate (blockId, newName, op) {
    tbAssert(newName,
             `[block ${blockId}] empty new column name for mutate`)
    tbAssert(typeof op === 'function',
             `[block ${blockId}] new value is not a function`)
    const newData = this.data.map(row => {
      const newRow = {...row}
      newRow[newName] = op(row)
      return newRow
    })
    return new TidyBlocksDataFrame(newData)
  }

  /**
   * Select columns.
   * @param {string[]} columns The names of the columns to keep.
   * @returns A new dataframe.
   */
  select (blockId, columns) {
    tbAssert(columns.length !== 0,
             `[block ${blockId}] no columns specified for select`)
    tbAssert(this.hasColumns(columns),
             `[block ${blockId}] unknown column(s) [${columns}] in select`)
    const newData = this.data.map(row => {
      const result = {}
      columns.forEach(key => {
        result[key] = tbGet(blockId, row, key)
      })
      return result
    })
    return new TidyBlocksDataFrame(newData)
  }

  /**
   * Sort data by values in specified columns.
   * @param {string[]} columns Names of columns to sort by.
   * @returns New data frame with sorted data.
   */
  sort (blockId, columns, reverse) {
    tbAssert(columns.length !== 0,
             `[block ${blockId}] no columns specified for sort`)
    tbAssert(this.hasColumns(columns),
             `[block ${blockId}] unknown column(s) [${columns}] in sort`)
    const result = [...this.data]
    result.sort((left, right) => {
      return columns.reduce((soFar, col) => {
        if (soFar !== 0) {
          return soFar
        }
        if (left[col] < right[col]) {
          return -1
        }
        if (left[col] > right[col]) {
          return 1
        }
        return 0
      }, 0)
    })
    if (reverse) {
      result.reverse()
    }
    return new TidyBlocksDataFrame(result)
  }

  /**
   * Summarize values (possibly grouped).
   * @param {string} operations A list of [blockId, function, columnName] pairs.
   * @return A new dataframe.
   */
  summarize (blockId, ...operations) {
    // Handle empty case.
    if (this.data.length === 0) {
      return new TidyBlocksDataFrame([])
    }

    // Put data into groups.
    const [wasGrouped, groups] = this._groupify()

    // Summarize by group and function.
    const summarized = {}
    operations.forEach(([subBlockId, func, sourceColumn]) => {
      if (subBlockId === undefined) {
        subBlockId = blockId
      }
      tbAssert(sourceColumn,
               `[block ${subBlockId}] no column specified for summarize`)
      tbAssert(this.hasColumns(sourceColumn),
               `[block ${subBlockId}] unknown column "${sourceColumn}" in summarize`)
      const newColumn = `${sourceColumn}_${func.colName}`
      summarized[newColumn] = groups.map(group => func(group, sourceColumn))
    })

    // Pivot.
    const result = []
    groups.forEach((group, i) => {
      const row = {}
      if (wasGrouped) {
        row._group_ = i
      }
      result.push(row)
    })
    Object.keys(summarized).forEach(newColumn => {
      groups.forEach((group, i) => {
        result[i][newColumn] = summarized[newColumn][i]
      })
    })

    // Create new dataframe.
    return new TidyBlocksDataFrame(result)
  }

  //
  // Put the data into groups.
  //
  _groupify () {
    const wasGrouped = this.hasColumns('_group_')
    const groups = []
    if (wasGrouped) {
      this.data.forEach(row => {
        if (row._group_ < groups.length) {
          groups[row._group_].push(row)
        }
        else {
          groups.push([row])
        }
      })
    }
    else {
      groups.push(this.data)
    }
    return [wasGrouped, groups]
  }

  /**
   * Remove grouping if present.
   * @returns A new dataframe.
   */
  ungroup (blockId) {
    tbAssert(this.hasColumns('_group_'),
             `[block ${blockId}] cannot ungroup data that is not grouped`)
    const newData = this.data.map(row => {
      row = {...row}
      delete row._group_
      return row
    })
    return new TidyBlocksDataFrame(newData)
  }

  //------------------------------------------------------------------------------

  /**
   * Join two tables on equality between values in specified columns.
   * @param {function} getDataFxn How to look up data by name.
   * @param {string} leftTable Notification name of left table to join.
   * @param {string} leftColumn Name of column from left table.
   * @param {string} rightTable Notification name of right table to join.
   * @param {string} rightColumn Name of column from right table.
   * @returns A new dataframe.
   */
  join (getDataFxn, leftTableName, leftColumn, rightTableName, rightColumn) {

    const _addFieldsExcept = (result, tableName, row, exceptName) => {
      Object.keys(row)
        .filter(key => (key != exceptName))
        .forEach(key => {result[`${tableName}_${key}`] = row[key]})
    }

    const leftFrame = getDataFxn(leftTableName)
    tbAssert(leftFrame.hasColumns(leftColumn),
             `left table does not have column ${leftColumn}`)
    const rightFrame = getDataFxn(rightTableName)
    tbAssert(rightFrame.hasColumns(rightColumn),
             `right table does not have column ${rightColumn}`)

    const result = []
    for (let leftRow of leftFrame.data) { 
      for (let rightRow of rightFrame.data) { 
        if (leftRow[leftColumn] === rightRow[rightColumn]) {
          const row = {'_join_': leftRow[leftColumn]}
          _addFieldsExcept(row, leftTableName, leftRow, leftColumn)
          _addFieldsExcept(row, rightTableName, rightRow, rightColumn)
          result.push(row)
        }
      }
    } 

    return new TidyBlocksDataFrame(result)
  }

  /**
   * Notify the pipeline manager that this pipeline has completed so that downstream joins can run.
   * Note that this function is called at the end of a pipeline, so it does not return 'this' to support method chaining.
   * @param {function} notifyFxn Callback functon to do notification (to decouple this class from the manager).
   * @param {string} name Name of this pipeline.
   */
  notify (notifyFxn, name) {
    notifyFxn(name, this)
  }

  //------------------------------------------------------------------------------

  /**
   * Call a plotting function. This is in this class to support method chaining
   * and to decouple this class from the real plotting functions so that tests
   * will run.
   * @param {object} environment Connection to the outside world.
   * @param {object} spec Vega-Lite specification with empty 'values' (filled in here with actual data before plotting).
   * @returns This object.
   */
  plot (environment, spec) {
    environment.displayTable(this.data)
    if (Object.keys(spec).length !== 0) {
      spec.data.values = this.data
      environment.displayPlot(spec)
    }
    return this
  }

  //------------------------------------------------------------------------------

  /**
   * Test whether the dataframe has the specified columns.
   * @param {string[]} names Names of column to check for.
   * @returns {Boolean} Are columns present?
   */
  hasColumns (names) {
    if (this.data.length === 0) {
      return false
    }
    if (typeof names === 'string') {
      names = [names]
    }
    return names.every(n => (n in this.data[0]))
  }

  /**
   * Convert columns to numeric values.
   * @param {string[]} columns The names of the columns to convert.
   * @returns This object.
   */
  toNumber (blockId, columns) {
    this.data.forEach(row => {
      columns.forEach(col => {
        row[col] = parseFloat(tbGet(blockId, row, col))
      })
    })
    return this
  }
}