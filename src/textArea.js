import React from "react";

const Code = props => {
  return (
    <div>
      <pre class="prettyprint linenums">{props.code}</pre>
    </div>
  );
};

Code.defaultProps = {
  code: `run blocks to see code`
};

class generatedCode extends React.Component {
  render() {
    return (
      <div>
        <Code
        // change if test is empty string
        // then populate with default
        />
      </div>
    );
  }
}

export default generatedCode;
