import React from "react";

class TextArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div><pre>{this.props.code}</pre></div>
      </div>
    );
  }
}

export default TextArea;
