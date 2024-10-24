import React, { Component } from "react";
import {
  Col,
  Row,
  Nav,
  Card,
  Table,
  Form,
  Button,
  ButtonGroup,
  Breadcrumb,
  InputGroup,
  Dropdown,

} from "@themesberg/react-bootstrap";
import { FormGroup, CardHeader, Media, Input, Modal } from "reactstrap";
import Select from 'react-select';
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faUnlockAlt, faEyeSlash, faEye, faLocationArrow, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addClient, editClient} from "../../services/clientService";
import AsyncSelect from "react-select/async";
import ReactDatetime from "react-datetime";
import moment from "moment"

export class EditClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
  
      dated: moment().startOf('month'),
      id: props.client.id,
      client: props.client

    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
   
  }

 
  dateFilter = async (e, state) => {
    await this.setState({ [state]: e })
  }

  onSaveClient = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {name, email, phone, address}=this.state.client;
    const {  validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        name: name !== '' && name !== undefined,
        phone: phone !== '' && phone !== undefined,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveClient();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      //await toast.configure({hideProgressBar: true, closeButton: false});
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });

      toast(
        <div style={{ padding: "10px 20px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>Errors:</p>
          {errors.map((v) => (
            <p key={v} style={{ margin: 0, fontSize: 14, color: "red" }}>
              * {this.validationRules(v)}
            </p>
          ))}
        </div>
      )
    }
  };


  validationRules = (field) => {
    if (field === "name") {
      return "Name  is required";
    } else if (field == 'phone') {
      return "Phone is required"
    }
  };




  saveClient = () => {
    this.setState({ saving: true });
    const { client, id } = this.state;
    console.log();
    editClient({
      id:id,
      name: client.name,
      email: client.email,
      address: client.address,
      phone: client.phone,
     

    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false, saving:false });
        this.props.saved();
        this.props.toggle();
        this.showToast("Client has been updated");
      },
      (err) => {

        if (err) {
          toast.dismiss();
          toast.configure({ hideProgressBar: true, closeButton: false });
          if (err) {
            this.showToastError('An error occured')
          }
          this.setState({ saving: false });
        }
        this.setState({ loading: false });
      }
    );
  };

  

  showToast = msg => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  }
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };

  onChange = (e, state) => {
    const { client } = this.state

    this.setState({ client: { ...client, [state]: e } })
  }

  

  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };






  render() {

    const { toggle } = this.props;

    const { saving, edit, client, loading } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-top"
          isOpen={client != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {saving && <SpinDiv text={"Saving..."} />}
          {loading && <SpinDiv text={"loading..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
                {client && (

                  <Button color={edit ? "secondary" : "success"}
                    onClick={this.toggleEdit}
                    size="sm" variant="outline-primary" >
                    {edit ? "Discard Changes" : "Edit Client"}



                  </Button>
                )}
              </ButtonGroup>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Card border="light" className="shadow-sm mb-4">
            <Card.Body className="pb-0">
            <Row>
              <Col md={12} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Name</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="title"
                      placeholder='Enter Title'
                      value={client.name}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "name");
                      }}
                      type="text"
                    />
                  </Form.Group>

                </Col>
              </Row>
              <Row>
              <Col md={6} >
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>

                    <Input
                      id="state"
                      required
                      value={client.email}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "email");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />

                  
                  </Form.Group>

                </Col>
                
              </Row>
              
              <Row>
                
                <Col md={6} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Phone</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="gift"
                      placeholder=''
                      value={client.phone}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "phone");
                      }}
                      type="text"
                    />
                  </Form.Group>

                </Col>
                
              </Row>

              <Row>
                <Col md={6} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Address</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="reason"
                      placeholder='Enter Description'
                      value={client.address}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "address");
                      }}
                      type="textarea"
                    />
                  </Form.Group>

                </Col>

              </Row>
              <Row>

              </Row>
              <Row style={{ marginTop: "10px" }}>
                <Col md={12}>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ marginTop: "10px", float: "right" }}
                      disabled={saving}
                      onClick={this.onSaveClient}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="transparent"
                      data-dismiss="modal"
                      type="button"
                      disabled={saving}
                      style={{ marginTop: "10px", float: "right" }}
                      onClick={toggle}
                    >
                      {" "}
                      Close
                    </Button>
                  </div>
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default EditClient;
