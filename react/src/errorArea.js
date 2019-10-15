import React from "react";

class ErrorArea extends React.Component {

  render() {
    return (
      <div>
        <div><pre>{this.props.error}</pre></div>
      </div>
    );
  }
}

export default ErrorArea;