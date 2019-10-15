import React from "react";

class ErrorArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div><pre>{this.props.error}</pre></div>
      </div>
    );
  }
}

export default ErrorArea;