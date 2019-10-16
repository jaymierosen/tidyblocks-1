import React from 'react';
import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import './BlocklyComponent.css';
import 'blockly/blocks'
import { createValidator, SINGLE_COLUMN_NAME, MULTIPLE_COLUMN_NAMES, SINGLE_COLUMN_FIELDS, MULTIPLE_COLUMN_FIELDS } from '../tidyblocks/gui'
import {tidyBlockStyles, tidyCategoryStyles} from '../tidyblocks/themes'

class BlocklyComponent extends React.Component {
      
    componentDidMount() {

        SINGLE_COLUMN_FIELDS.forEach(col => {
            Blockly.Extensions.register(`validate_${col}`, createValidator(col, SINGLE_COLUMN_NAME))
          })
        
          MULTIPLE_COLUMN_FIELDS.forEach(col => {
            Blockly.Extensions.register(`validate_${col}`, createValidator(col, MULTIPLE_COLUMN_NAMES))
        })

        const { initialXml, children, ...rest } = this.props;
        this.primaryWorkspace = Blockly.inject(
            this.blocklyDiv,
            {
                toolbox: this.toolbox,
                zoom:
                    {controls: true,
                     wheel: true,
                    startScale: 1.0,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2},
                    theme: new Blockly.Theme(tidyBlockStyles, tidyCategoryStyles),
                ...rest
            },
        );

        if (initialXml) {
            Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(initialXml), this.primaryWorkspace);
        }

    }

    get workspace() {
        return this.primaryWorkspace;
    }

    setXml(xml) {
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.primaryWorkspace);
    }

    render() {
        const { children } = this.props;

        return <React.Fragment>
            <div ref={e => this.blocklyDiv = e} id="blocklyDiv" />
            <xml xmlns="https://developers.google.com/blockly/xml" is="blockly" style={{ display: 'none' }} ref={(toolbox) => { this.toolbox = toolbox; }}>
                {children}
            </xml>
        </React.Fragment>;
    }

}

export default BlocklyComponent;