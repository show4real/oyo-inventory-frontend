import React from "react";

import { Spinner } from "reactstrap";

class SpinDiv extends React.Component {
  render() {
    const {text} = this.props
    return (
      <>
        <div
          style={{
            position: 'absolute', left: 0, right: 0, width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
            backgroundColor: '#fff', opacity: 0.8
          }}
        >
          <Spinner type="grow" color="primary" style={{width: '2rem', height: '2rem', zIndex: 10001}} />
          {text&&<p style={{margin: 0, fontWeight: '700'}}>{text}</p>}
        </div>
      </>
    );
  }
}

export default SpinDiv;
