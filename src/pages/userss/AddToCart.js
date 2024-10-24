import React, { Component } from 'react';

import {
    Button,
    Modal
  } from "reactstrap";
  import { toast } from 'react-toastify';
  import SpinDiv from "../components/SpinDiv";
  import { Alert} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";


export class AddToCart extends Component {

    constructor(props) {
		super(props);
    this.state = {
      project: props.addToCart,
      loading: false,
      search: '',
      validation: {},
      name: ''
    };
	}

  componentDidMount() {
    toast.configure({hideProgressBar: true, closeButton: false});
  }

  onDelete = () => {
    this.setState({loading: true});
    const {project} = this.state;
    
  }

   DismissableAlerts() {
    const [hiddenAlerts, setHiddenAlerts] = React.useState([]);
  
    const onClose = (alertId) => {
      const hiddenAlertsUpdated = [...hiddenAlerts, alertId];
      setHiddenAlerts(hiddenAlertsUpdated);
    };
  
    const shouldShowAlert = (alertId) => (
      hiddenAlerts.indexOf(alertId) === -1
    );
    }

  showToast = msg => {
    toast.error(<div style={{padding:20}}>{msg}</div>);
  }

    render() {
        const { deleteProject, toggle } = this.props
    const {project, loading} = this.state;
    return (
      <>
       <Alert
        variant="success"
        show={this.shouldShowAlert("success")}
        onClose={() => this.onClose("success")}>

        <div className="d-flex justify-content-between">
          <div>
            <FontAwesomeIcon icon={faBullhorn} className="me-1" />
            <strong>Holy guacamole!</strong> You should check in on some of those fields below.
          </div>
          <Button variant="close" size="xs" onClick={() => this.onClose("success")} />
        </div>
      </Alert>

      

      </>
    );
    }
}

export default AddToCart
