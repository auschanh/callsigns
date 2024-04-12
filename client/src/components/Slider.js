import React from "react";
import ReactSlider from "react-slider";


const Slider = ({ onChange, currentIndex, numCards, cards }) => {
  return (
    <ReactSlider
      className="vertical-slider pointer-events-none"
      markClassName="example-mark"
      onChange={onChange}
      trackClassName="example-track"
      defaultValue={0}
      value={currentIndex}
      min={0}
      max={numCards}
      marks
      renderMark={(props) => {
        if (props.key < currentIndex) {
          props.className = "example-mark example-mark-completed";
        } else if (props.key === currentIndex) {
          props.className = "example-mark example-mark-active animate-pulse";
        }
        return <span {...props}/>
      }}
      orientation="vertical"
    />
  );
};

export default Slider;
