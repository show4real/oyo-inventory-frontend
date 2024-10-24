import React, { Component } from "react";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import {Button} from "antd"
import {editSerialNo} from "../../services/purchaseOrderService"
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";


export class EditSerial extends Component {
  constructor(props) {
    super(props);
    this.state = {
     saving:false,
     loading:false,
     serial_no:props.serial.serial_no,
     id:props.serial.id,
     submitted:false,
    };
  }

  onChange = (e, state)=>{
    this.setState({[state]: e})
  }

  onSave = async () => {
    await toast.dismiss();
      const {serial_no} = this.state;
      this.setState({submitted:true})
    let check_serial = serial_no == '' || null  ? false : true;
    console.log(check_serial)
    if(check_serial){
        this.saveSales()
    } else{
      this.setState({ loading: false, saving: false });
    }

  }

  saveSales = async () => {
    await toast.dismiss();
    this.setState({saving: true });
   
    const { serial_no, id} = this.state;
    this.setState({ saving: true });
    editSerialNo({
      serial_no: serial_no,
      id:id
    }).then(
      (res) => {
        this.setState({ loading: false, saving: false });
        this.showToast("Serial No has been updated");
        this.props.toggle()
      },
      (error) => {
        this.setState({ loading: false, saving:false });
        alert("Serial No Existed, Please Add another");
        
      }
    );
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };






  render() {
    const { serial, toggle } = this.props;

    const { saving, submitted, serial_no, loading, stock } = this.state;
    return (
      <>
         {saving && <SpinDiv text={"Saving..."} />}
         {loading && <SpinDiv text={"loading..."} />}
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={serial != null}
          toggle={() => !loading && !saving && toggle}
           style={{ maxWidth:500 }}
        >
            <div className="modal-header" style={{ padding: "1rem" }}>
                <h5>Edit Serial No</h5>
            
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Row>
              <Col md={12}>
                  <Row>
                      <Col md={2}></Col>
                      <Col md={6}>
                      <Col md={3}></Col>
                      <Form.Group>
                      <Form.Label>Serial No</Form.Label>
                      <Input 
                        value={serial_no}
                        onChange={async (e) => {
                            await this.onChange(e.target.value, "serial_no");
                          }}
                      
                      />
                  </Form.Group>
                  {submitted && !serial_no && (
                    <div style={{ color: "red" }}>Serial is required</div>
                )}
                      </Col>
                  </Row>
              </Col>
          </Row>
          <Row>
                <Col md={8}></Col>
              <Col md={3} style={{marginBottom:10}}>
                <Button onClick={()=>{this.onSave()}}>
                        Save 
                </Button>
              </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

export default EditSerial;
