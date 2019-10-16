import React from "react";
import { CSVLink } from "react-csv";


/* 
PLOT AREA TO PDF
https://stackoverflow.com/questions/53117630/generating-pdf-from-html-in-react-using-html2canvas-and-jspdf

import { View as ViewPDF } from '@react-pdf/renderer';
import { RENDERING_CONTEXT, withRenderingContext } from '../RenderingContext';

class View extends React.Component {
  render() {
    const { renderingContext, children, className, style } = this.props;
    const isPdf = renderingContext === RENDERING_CONTEXT.PDF;
    return isPdf
      ? <ViewPDF className={className} style={style}>
          {children}
        </ViewPDF>
      : <div className={className} style {style}>
          {children}
        </div>;
  }
}
*/

export default withRenderingContext(View);

class NavBar extends React.Component {

  constructor(props) {
    super(props);
    
    this.loadCode = this.loadCode.bind(this)
  }

  loadCode() {
    // print this.props.xml to file
  }

  render() {
    return (
    <div>

    <div>
    {/* look into link.setAttribute from old tidyblocks repo*/}
    <button>Download XML</button>

    <CSVLink data={this.props.table}>
    <button>Download CSV</button>
    </CSVLink>

    <button>Download Plot</button>
    </div>

    <div>
    <button>Upload XML</button>
    </div>

    </div>
    )
  }
}

export default NavBar2;