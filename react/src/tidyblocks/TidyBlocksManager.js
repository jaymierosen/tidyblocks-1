import React from 'react'
import { fixCode } from './tidyblocks'

const TIDYBLOCKS_START = '/* tidyblocks start */'

export default class TidyBlocksManager extends React.Component {

  constructor () {
    this.reset()
  }

  /**
   * Record a newly-created block and add the ID to its tooltip.
   * @param {block} block Newly-created block.
   */
  addNewBlock (block) {
    block.tbId = this.nextBlockId
    block.tooltip = `[${block.tbId}] ${block.tooltip}`
    this.blocks.set(this.nextBlockId, block)
    this.nextBlockId += 1
  }

  /**
   * Get the number of blocks that have been created (including ones that have
   * now been deleted).
   */
  getNumBlocks () {
    return this.blocks.size
  }

  /**
   * Get a block by serial number.
   * @param {number} blockId Serial number of block.
   * @returns {block} The block or null.
   */
  getBlock (blockId) {
    return this.blocks.has(blockId) ? this.blocks.get(blockId) : null
  }

  /**
   * Get the output of a completed pipeline.
   * @param {string} name Name of completed pipeline.
   * @return TidyBlocksDataFrame.
   */
  getResult (name) {
    return this.results.get(name)
  }

  /**
   * Notify the manager that a named pipeline has finished running.
   * This enqueues pipeline functions to run if their dependencies are satisfied.
   * @param {string} name Name of the pipeline that just completed.
   * @param {Object} dataFrame The TidyBlocksDataFrame produced by the pipeline.
   */
  notify (name, dataFrame) {
    this.results.set(name, dataFrame)
    this.waiting.forEach((dependencies, func) => {
      dependencies.delete(name)
      if (dependencies.size === 0) {
        this.queue.push(func)
      }
    })
  }

  /**
   * Register a new pipeline function with what it depends on and what it produces.
   * @param {string[]} depends Names of things this pipeline depends on (if it starts with a join).
   * @param {function} func Function encapsulating pipeline to run.
   * @param {function} produces Name of this pipeline (used to trigger things waiting for it).
   */
  register (depends, func, produces) {
    if (depends.length == 0) {
      this.queue.push(func)
    }
    else {
      this.waiting.set(func, new Set(depends))
    }
  }

  /**
   * Reset internal state.
   */
  reset () {
    this.queue = []
    this.waiting = new Map()
    this.results = new Map()
    this.blocks = new Map()
    this.nextBlockId = 0
  }

  /**
   * Run all pipelines in an order that respects dependencies.
   * This depends on `notify` to add pipelines to the queue.
   * @param {object} environment How to interact with the outside world.
   */
  run (environment) {
    environment.displayError('') // clear legacy errors
    try {
      let code = environment.getCode()
      if (! code.includes(TIDYBLOCKS_START)) {
        throw new Error('pipeline does not have a valid start block')
      }
      code = fixCode(code)
      eval(code)
      while (this.queue.length > 0) {
        const func = this.queue.shift()
        func()
      }
    }
    catch (err) {
      environment.displayError(err.message)
    }
  }

  /*
  render() {
    return (<div>{this.props.enviornment()}</div>)
  }
  */
  
}