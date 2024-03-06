import React from 'react';

const Button = function(props) {

    return (

        <button type="button" className={props.btnClass} id={props.btnID} onClick={props.btnClick}>{props.label}</button>
        
    );
}

export default Button;