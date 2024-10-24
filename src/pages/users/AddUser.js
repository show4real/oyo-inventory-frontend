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
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SpinDiv from "../components/SpinDiv";
import axios from 'axios'
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify"
import { FormGroup, CardHeader, Media, Input, Modal } from "reactstrap";

import Select from 'react-select';
import ReactFormValidation from "react-form-input-validation";
import ReactFormInputValidation from "react-form-input-validation";
const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneReg = /^([0]\d{10})$/;
export class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields:{
        firstname:'',
        lastname:'',
        phone:'',
        password:'',
        email:'',
        is_active:false,
        admin:false
      },
      search: "",
      page: 1,
      selectedTitle: "",
      // selectedRoles: [],
      inputValue: "",
      product_id: "",
      rows: 10,
      loading: false,
      tags: [],
      branches:props.branches,
      validation: {},
      errors: {},
      // options: props.roles.map(function (obj) {
      //   obj['value'] = obj['id']; // Assign new key
      //   obj['label'] = obj['name'];
      //   delete obj['name']; // Delete old key 
      //   delete obj['id'];
      //   return obj;
      // }),
      
    };
    this.form = new ReactFormValidation(this, { locale: "en" });
    this.form = new ReactFormInputValidation(this);
    this.form.useRules({
      lastname: "required|max:10",
      firstname: "required|max:10",
      email: "required|email",
      password: "required|min:5",
      phone: "required|numeric|digits_between:10,12",
      address: "required|max:10",

    
    });
  }

  validationRules = (field) => {
    if (field === "password") {
      return "Password is required";
    } else if (field === "firstname") {
      return "First name is required";
    } else if (field === "address") {
      return "Address is required";
    } else if (field === "phone") {
      return "Phone is required";
    } else if (field === "lastname") {
      return "Last name is required";
    } else if (field === "email") {
      return "Email is required";
    } else if (field === "branch_id") {
      return "Branch is required";
    }
  };


  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };
  componentDidMount = () => {
    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });
  }


  onSaveUser = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { email, phone, password, firstname, branch_id, lastname,fields, address, validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        email: emailReg.test(fields.email),
        phone: phoneReg.test(fields.phone),
        address: fields.address !== '' && fields.address !== undefined,
        password: fields.password !== '' && fields.password !== undefined,
        firstname: fields.firstname !== '' && fields.firstname !== undefined,
        lastname: fields.lastname !== '' && fields.lastname !== undefined,
        branch_id:branch_id !== '' && branch_id !== undefined,

      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveUser();
    } else {
      const errorss = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });
      toast(
        <div style={{ padding: "10px 20px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>Errors:</p>
          {errorss.map((v) => (
            <p key={v} style={{ margin: 0, fontSize: 14, color: "red" }}>
              * {this.validationRules(v)}
            </p>
          ))}
        </div>
      );
    }
  };

  saveUser = () => {
    this.setState({ saving: true });

    const { fields, is_active, branch_id, admin } = this.state;

    let data = new FormData();
    data.set("email", fields.email);
    data.set("firstname", fields.firstname);
    data.set("password", fields.password);
    data.set("lastname", fields.lastname);
    data.set("phone", fields.phone);
    if (is_active == true) {
      data.set("status", 1);
    } else {
      data.set("status", 0);
    }
    if (admin == true) {
      data.set("admin", 1);
    } else {
      data.set("admin", 0);
    }
    data.set("branch_id", branch_id);

    data.set("address", fields.address);
    // let op = this.state.selectedRoles;
    // for (var i in op) {
    //   data.set(`role_id[${i}]`, op[i].value);
    // }
    return axios
      .post(
        `${settings.API_URL}adduser`,
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
        this.showToast("User created");
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

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  // roleHandleChange = (selectedRoles) => {
  //   this.setState({ selectedRoles });
  // }



  render() {
    const Required = () => (<span style={{ color: 'red' }}>*</span>)
    const { addUser, toggle } = this.props;
    const { loading, saving,name,firstname,lastname,email,password,address,phone,
       validation, options, branch_id,fields, errors, branches,  is_active, admin } = this.state;
    return (
      <>
      
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addUser != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}

        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5 className="modal-title" id="exampleModalLabel">
                Create User
              </h5>
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
                {saving && <SpinDiv text={"Saving..."} />}
                <Col md={12} className="mb-3">

                  <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '0 2px', borderRadius: 7 }}>
                    <Col md={6}>

                      <Form.Group className="mb-2">
                        <Form.Label >  <Required /> Last Name</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </InputGroup.Text>
                          <Input
                      
                          type="text" placeholder="Enter Last Name"
                          name='lastname'
                          onBlur={this.form.handleBlurEvent}
                          value={lastname}
                          onChange={this.form.handleChangeEvent}
                          required
                          data-attribute-name="Last Name"
                          data-async
                          
                          />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.lastname ? this.state.errors.lastname : ""}
                        </Form.Label>

                      
                      </Form.Group>

                    </Col>
                    <Col md={6}>

                      <Form.Group className="mb-2">
                      <Form.Label >  <Required /> First Name</Form.Label>
                      <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </InputGroup.Text>
                          <Input
                      
                          type="text" placeholder="Enter First Name"
                          name='firstname'
                          onBlur={this.form.handleBlurEvent}
                          value={firstname}
                          onChange={this.form.handleChangeEvent}
                          required  
                          data-attribute-name="First Name"
                          data-async
                          />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.firstname ? this.state.errors.firstname : ""}
                        </Form.Label>

                      </Form.Group>

                    </Col>




                  </Row>
                  <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '10px 2px', borderRadius: 7 }}>
                    <Col md={6}>

                      <Form.Group className="mb-2">
                        <Form.Label>  <Required /> Phone</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPhone} />
                          </InputGroup.Text>
                          <Input
                      
                          type="text" placeholder="Enter Phone Number"
                          name='phone'
                          onBlur={this.form.handleBlurEvent}
                          value={phone}
                          onChange={this.form.handleChangeEvent}
                          required 
                          data-attribute-name="Phone Number"
                          data-async
                          />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.phone ? this.state.errors.phone : ""}
                        </Form.Label>

                      </Form.Group>

                    </Col>
                    <Col md={6}>

                      <Form.Group className="mb-2">
                        <Form.Label> <Required />Email</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faEnvelope} />
                          </InputGroup.Text>
                          <Input
                      
                          type="text" placeholder="Enter Email"
                          name='email'
                          onBlur={this.form.handleBlurEvent}
                          value={email}
                          onChange={this.form.handleChangeEvent}
                          required  
                          data-attribute-name="Email"
                          data-async
                          />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.email ? this.state.errors.email : ""}
                        </Form.Label>

                      </Form.Group>

                    </Col>
                  </Row>

                  <Row style={{ border: '1px #eee solid', padding: '10px 5px 0px', margin: '10px 2px', borderRadius: 7 }}>
                    
                
                <Col md="6">
                  <Form.Group className="mb-2">
                    <Form.Label>Branch</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={branch_id}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "branch_id");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >
                      <option value="">choose Branch</option>
                      {branches.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              
                    {/* <Col md={6}>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="input-product_id"
                          style={{marginBottom:10}}
                        >

                          Assign roles to user
                        </label>

                        <Select
                          isMulti
                          value={selectedRole}
                          onChange={this.roleHandleChange}
                          options={options}

                        />
                      </FormGroup>
                    </Col> */}
                    <Col md={6}>

                      <Form.Group className="mb-2">
                        <Form.Label> <Required />Password</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faLock} />
                          </InputGroup.Text>
                          <Input
                      
                          type="password" placeholder="Enter Password"
                          name='password'
                          onBlur={this.form.handleBlurEvent}
                          value={password}
                          onChange={this.form.handleChangeEvent}
                          required  
                          data-attribute-name="Password"
                          data-async
                          />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.password ? this.state.errors.password : ""}
                        </Form.Label>

                      
                      </Form.Group>

                    </Col>
                    <Col md={6}>

                      <Form.Group className="mb-2">
                        <Form.Label>Address</Form.Label>

                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faAddressCard} />
                          </InputGroup.Text>
                          <Input
                      
                          type="text" placeholder="Enter Address"
                          name='address'
                          onBlur={this.form.handleBlurEvent}
                          value={address}
                          onChange={this.form.handleChangeEvent}
                          required  />
                        </InputGroup>
                        <Form.Label style={{color:'red'}} > 
                          {this.state.errors.address ? this.state.errors.address : ""}
                        </Form.Label>

                      </Form.Group>

                    </Col>
                  </Row>
                  <Row style={{ border: '1px #eee solid', padding: '5px 5px 5px', margin: '10px 2px 7px', borderRadius: 7 }}>
                    <Col md={3} style={{ paddingTop: 15 }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ paddingRight: 10 }}>Active</Form.Label>
                        <Input
                          className="custom-control-input"
                          id="is_active"
                          checked={is_active}
                          onChange={async (e) => {
                            await this.onChange(e.target.checked, "is_active");
                          }}
                          type="checkbox"
                        />
                      </Form.Group>

                    </Col>
                    <Col md={3} style={{ paddingTop: 15 }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ paddingRight: 10 }}>Admin</Form.Label>
                        <Input
                          className="custom-control-input"
                          id="admin"
                          checked={admin}
                          onChange={async (e) => {
                            await this.onChange(e.target.checked, "admin");
                          }}
                          type="checkbox"
                        />
                      </Form.Group>

                    </Col>
                  </Row>
                  <Row style={{ float: 'right' }}>
                    <div className="modal-footer" style={{ padding: '1rem' }}>
                      <Button
                        size="sm"
                        variant='transparent'
                        data-dismiss="modal"
                        type="button"
                        onClick={toggle}
                      >
                        Close
                      </Button>
                      <Button variant="primary" type="button" disabled={saving} size="sm"
                        onClick={this.onSaveUser}
                       >
                        Save
                      </Button>
                    </div>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default AddUser;
