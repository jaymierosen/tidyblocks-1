import React from "react";

const RenderRow = (props) =>{
  return props.keys.map((key, index)=>{
  return <td key={props.data[key]}>{props.data[key]}</td>
  })
}

export default class Table extends React.Component {
 
  constructor(props){
  super(props);
  this.getHeader = this.getHeader.bind(this);
  this.getRowsData = this.getRowsData.bind(this);
  this.getKeys = this.getKeys.bind(this);
  }
  
  getKeys = function(){
    if (this.props.data[0]) {
      return Object.keys(this.props.data[0])
  } else {
    return ""
  }
}
  
  getHeader = function(){
    var keys = this.getKeys();

    if (keys === "") {
      return ""
    } else {
      return keys.map((key, index)=>{
        return <th key={key}>{key}</th>
      })
    }
  }

  getRowsData = function(){
 var items = this.props.data;
 var keys = this.getKeys();

 if (keys === "") {
   return ""
 } else {
  return items.map((row, index)=>{
    return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
    })
 }
 }
  
  render() {
  return (
  <div>
  <table>
  <thead>
  <tr>{this.getHeader()}</tr>
  </thead>
  <tbody>
  {this.getRowsData()}
  </tbody>
  </table>
  </div>
  
  );
  }
}