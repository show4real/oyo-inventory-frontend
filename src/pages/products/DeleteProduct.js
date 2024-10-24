import React from "react";
import {
  Button,
  Modal
} from "reactstrap";
import { toast } from 'react-toastify';

import { deleteProduct } from "../../services/productService";
import SpinDiv from "../components/SpinDiv";

class DeleteProduct extends React.Component {
	constructor(props) {
		super(props);
    this.state = {
      product: props.deleteP,
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
    const {product} = this.state;
    console.log(product);
    deleteProduct(product.id)
      .then(res => {
          console.log(res)
          this.setState({loading: false});
          this.props.saved();
          this.props.toggle();
          this.showToast('Product Deleted')
      },
    	error => {
        this.showToast('Product cannot be deleted')
        this.setState({loading: false});
    	});
  }

  showToast = msg => {
    toast.error(<div style={{padding:20}}>{msg}</div>);
  }

  render() {
    const { deleteP, toggle } = this.props
    const {product, loading} = this.state;
    return (
      <>
        <Modal
          className="modal-dialog-centered"
          isOpen={deleteP!=null}
          toggle={() => !loading&&toggle}
          style={{maxWidth: 600}}
        >
          {loading&&<SpinDiv text={'Deleting...'} />}
          <div className="modal-header" style={{padding: '1rem'}}>
            <h3 className="modal-title" id="exampleModalLabel">
              Delete product - {product.name}
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
            Are you sure you want to delete this product? <br/><br/>
            This action is irreversible and all data associated with this product will be lost permanently!
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

export default DeleteProduct;
