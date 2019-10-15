import React from "react";

class PlotArea extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div>{this.props.plot}</div>
      </div>
    );
  }
}

export default PlotArea;