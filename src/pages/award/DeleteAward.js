import React from "react";
import {
  Button,
  Modal
} from "reactstrap";
import { toast } from 'react-toastify';

import { deleteLeave } from "../../services/leaveService";
import SpinDiv from "../components/SpinDiv";

class DeleteLeave extends React.Component {
	constructor(props) {
		super(props);
    this.state = {
      leave: props.deleteLeave,
      loading: false,
      search: '',
      validation: {},
      name: ''
    };
	}

  componentDidMount() {
    toast.configure({hideProgressBar: true, closeButton: false});
  }

  showToast = msg => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  }
   showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };
  onDelete = () => {
    this.setState({loading: true});
    const {leave} = this.state;
    console.log(leave);
    deleteLeave(leave.id)
      .then(res => {
          console.log(res)
          this.setState({loading: false});
          this.props.saved();
          this.props.toggle();
          this.showToast('leave Deleted')
      },
    	error => {
        this.showToastError('leave cannot be deleted')
        this.setState({loading: false});
    	});
  }

 

  render() {
    const { toggle } = this.props
    const {leave, loading} = this.state;
    return (
      <>
        <Modal
          className="modal-dialog-centered"
          isOpen={leave!=null}
          toggle={() => !loading&&toggle}
          style={{maxWidth: 600}}
        >
          {loading&&<SpinDiv text={'Deleting...'} />}
          <div className="modal-header" style={{padding: '1rem'}}>
            <h3 className="modal-title" id="exampleModalLabel">
              Delete Leave - {leave.title} for {leave.name}
            </h3>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={toggle}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <div className="modal-body" style={{border: '1px solid #eee'}}>
            Are you sure you want to delete this Leave? <br/><br/>
            This action is irreversible !
          </div>
          <div className="modal-footer" style={{padding: '1rem'}}>
            <Button
              size="sm"
              color="secondary"
              data-dismiss="modal"
              type="button"
              disabled={loading}
              onClick={toggle}
            >
              Cancel
            </Button>
            <Button color="success" type="button" disabled={loading} size="sm"
              onClick={this.onDelete}
              style={{backgroundColor: '#EC3237', borderColor: '#EC3237', color: '#fff'}}>
              Delete
            </Button>
          </div>
        </Modal>
      </>
    );
  }
}

export default DeleteLeave;
