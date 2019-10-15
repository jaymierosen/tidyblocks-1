import React from "react";
import { CSVLink } from "react-csv";

class NavBar extends React.Component {

  constructor(props) {
    super(props);
    
    this.loadCode = this.loadCode.bind(this)
  }

  loadCode(fileList) {
    const file = fileList[0]
  }

  render() {
    return (
    <div>

    <div>
    {/* link.setAttribute */}
    <button>Download XML</button>

    <CSVLink data={this.props.table}>
    <button>Download CSV</button>
    </CSVLink>

    {/* html2canvas */}
    <button>Download Plot</button>
    </div>

    <div>
    {/* link.setAttribute */}
    <button onClick={this.loadCode}>Upload XML</button>
    </div>

    </div>
    )
  }
}

export default NavBar;