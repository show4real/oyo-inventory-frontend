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
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faUnlockAlt, faEyeSlash, faEye, faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import axios from 'axios'
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";

export class EditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.editUser,
      loading: false,
      search: '',
      validation: {},
      show:false,
      firstname: '',
      lastname:'',
      address:'',
      email:'',
      phone:'',
      password:'',
      edit:false,
      branches:props.branches
      
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
    //this.filter()
  }

  onSaveUser = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { user, validation } = this.state;
    const { firstname,lastname,branch_id, address,admin,status,phone,email } = user;
    await this.setState({
      validation: {
        ...validation,
        lastname: lastname !== '',
        firstname: firstname !== '',
        phone: phone !== '',
        email: email !== '',
        address: address !== '',
        branch_id: branch_id !== ''
        //password: password !== '',
      }
    })
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveUser();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id]
      })
      await setTimeout(() => toast.error(
        <div style={{ padding: '10px 20px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color:'red' }}>Errors:</p>
          {errors.map(v => (
            <p key={v} style={{ margin: 0, fontSize: 14, color:'red' }}>* {this.validationRules(v)}</p>
          ))}
        </div>
      ), 250);
    }
  }

  validationRules = field => {
    if (field === "firstname") {
      return "First name is required";
    } else if (field === "address") {
      return "Address is required";
    } else if (field === "phone") {
      return "Phone is required";
    } else if (field === "lastname") {
      return "Last name is required";
    } else if (field === "email") {
      return "Email is required";
    }else if (field === "branch_id") {
      return "Branch is required";
    }
  }

  
  saveUser = () => {
    this.setState({ saving: true });

    const {  firstname,lastname,branch_id, user,address,admin,status,phone,email,password } = this.state.user;

    let data = new FormData();
    data.set("email", email);
    data.set("firstname", firstname);
    if(password !== ''){
      data.set("password", password)
    }
    data.set("lastname", lastname);
    data.set("branch_id", branch_id);
    data.set("phone", phone);
    if (status == true) {
      data.set("status", 1);
    } else {
      data.set("status", 0);
    }
    if (admin == true) {
      data.set("admin", 1);
    } else {
      data.set("admin", 0);
    }

    data.set("address", address);
    // let op = this.state.selectedRoles;
    // for (var i in op) {
    //   data.set(`role_id[${i}]`, op[i].value);
    // }
    return axios
      .post(
        `${settings.API_URL}updateuser/${this.state.user.id}`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        this.setState({ saving: false, edit: false });
        this.props.saved();
        this.props.toggle();
        this.showToast("User updated");
      })
      .catch((err) => {
        if (err) {
          toast.dismiss();
          toast.configure({ hideProgressBar: true, closeButton: false });
          if (err.response.data.email) {
            this.showToastError('A user with this Email address already exist')
          }
          if (err.response.data.phone) {
            this.showToastError('A user with this Phone number already exist')
          }
          this.setState({ saving: false });
        }
      });
  };


  
  showToast = msg => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  }
   showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };

  onChange = (e, state) => {
    const { user } = this.state
    this.setState({ user: { ...user, [state]: e } })
  }

  // roleHandleChange = (selectedRoles) => {
  //   this.setState({ selectedRoles });
  // }
  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };



  render() {
    const { editUser, toggle } = this.props;

    const { saving, edit, loading, user,options,password,branches, show, previous_options } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={editUser != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
              {user && (
              
                <Button  color={edit ? "secondary" : "success"}
                            onClick={this.toggleEdit}
                            size="sm" variant="outline-primary" size="sm">
                    {edit ? "Discard Changes" : "Edit User"}
                  
                          
                          
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
                <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '0 2px', borderRadius: 7 }}>
                  <Col md={6} className="mb-3">
                    <Form.Group id="Lastname">
                      <Form.Label>Last Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </InputGroup.Text>
                        <Input

                          type="text" placeholder="Enter Last Name"
                          name='lastname'
                          disabled={!edit}
                          value={user.lastname || ''} required type="text" onChange={async (e) => {
                            await this.onChange(e.target.value, "lastname");
                          }}

                        />
                      </InputGroup>

                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group id="firstName">
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </InputGroup.Text>
                        <Input

                          type="text" placeholder="Enter First name"
                          name='firstname'
                          disabled={!edit}
                          value={user.firstname || ''} required type="text" onChange={async (e) => {
                            await this.onChange(e.target.value, "firstname");
                          }}

                        />
                      </InputGroup>

                    </Form.Group>
                  </Col>
                </Row>
                <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '0 2px', borderRadius: 7 }}>
                  <Col md={6} className="mb-3">
                    <Form.Group id="Lastname">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Input

                          type="text" placeholder="Enter Email"
                          name='email'
                          disabled={!edit}
                          value={user.email || ''} required type="text" onChange={async (e) => {
                            await this.onChange(e.target.value, "email");
                          }}

                        />
                      </InputGroup>

                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group id="phone">
                      <Form.Label>Phone</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faPhone} />
                        </InputGroup.Text>
                        <Input

                          type="text" placeholder="Enter Phone Digit"
                          name='phone'
                          disabled={!edit}
                          value={user.phone || ''} required type="text" onChange={async (e) => {
                            await this.onChange(e.target.value, "phone");
                          }}

                        />
                      </InputGroup>

                    </Form.Group>
                  </Col>
                </Row>
                <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '0 2px', borderRadius: 7 }}>
                
                  <Col md={6} className="mb-3">
                    <Form.Group id="address">
                      <Form.Label>Address</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faLocationArrow} />
                        </InputGroup.Text>
                        <Input

                          type="text" placeholder="Enter Address"
                          name='address'
                          disabled={!edit}
                          value={user.address || ''} required type="text" onChange={async (e) => {
                            await this.onChange(e.target.value, "address");
                          }}

                        />
                      </InputGroup>

                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                      <Form.Group id="lastName">
                        <Form.Label>Branch</Form.Label>
                        <Form.Select
                          id="state"
                          required
                          value={user.branch_id}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "branch_id");
                          }}
                        >
                          <option value="">Select Branch</option>
                          {branches.map((p, index) => (
                            <option value={p.id} key={p}>
                              {p.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  
                </Row>
                <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '0 2px', borderRadius: 7 }}>
                  <Col md={6}>
                  <Form.Group id="password" className="mb-4">
                        <Form.Label>Your Password</Form.Label>
                        <InputGroup>

                          <InputGroup.Text>
                        
                            <FontAwesomeIcon icon={show ? faEyeSlash : faEye } style={{ fontSize: 12, cursor: "pointer" }}
                          onClick={() => this.setState({ show: !show })} />
                            
                          </InputGroup.Text>
                          <Form.Control required type={show ? "text" : "password"}
                            placeholder="Password" 
                            disabled={!edit}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "password");
                            }}
                          />
                        </InputGroup>
                      </Form.Group>
                  </Col>
                  <Col md={3} style={{ paddingTop: 30 }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ paddingRight: 10 }}>Admin</Form.Label>
                        <Input
                          className="custom-control-input"
                          id="admin"
                          disabled={!edit}
                          checked={user.admin == 1 ? true : false}
                          onChange={async (e) => {
                            await this.onChange(e.target.checked, "admin");
                          }}
                          

                          type="checkbox"
                        />
                      </Form.Group>

                    </Col>

                    <Col md={3} style={{ paddingTop:30 }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ paddingRight: 10 }}>Active</Form.Label>
                        <Input
                          className="custom-control-input"
                          id="status"
                          disabled={!edit}
                          checked={user.status == 1 ? true : false}
                          onChange={async (e) => {
                            await this.onChange(e.target.checked, "status");
                          }}
                          

                          type="checkbox"
                        />
                      </Form.Group>

                    </Col>
                </Row>
                
              </Row>
              <Row style={{ marginTop: "10px" }}>
                <Col md={12}>
                {edit && (
                        <div>
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ marginTop: "10px", float: "right" }}
                          disabled={saving}
                          onClick={this.onSaveUser}
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
                      )}
                  
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default EditUser;
