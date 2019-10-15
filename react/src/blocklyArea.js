import React from "react";

class BlocklyArea extends React.Component {

  render() {
    return (
      <div>
        <div>{this.props.xml}</div>
      </div>
    );
  }
}

export default BlocklyArea;