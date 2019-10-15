import React from "react";

class PlotArea extends React.Component {

  render() {
    return (
      <div>
        <div>{this.props.plot}</div>
      </div>
    );
  }
}

export default PlotArea;