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
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { Route, Redirect } from 'react-router-dom';
import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { filterAttributes } from "../../services/purchaseOrderService";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import { quantity } from "chartist";
export class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      selectedTitle: "",
      inputValue: "",
      product_id: "",
      rows: 10,
      loading: false,
      tags: [],
      attributes: [],
      validation: {},
      branches:props.branches.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
    };
  }
  
  validationRules = (field) => {
    if (field === "password") {
      return "Password is required";
    } else if (field === "firstname") {
      return "First name is required";
    } else if (field === "address") {
      return "Address is required";
    } else if (field === "branch_id") {
    return "Branch is required";
  }else if (field === "phone") {
    return "Phone is required";
  }else if (field === "lastname") {
    return "Last name is required";
  }else if (field === "email") {
    return "Email is required";
  }
  };

  
  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  componentDidMount=()=>{
    toast.dismiss();
    toast.configure({ hideProgressBar: true, closeButton: false });
  }


  onSaveUser = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {email,phone,password,firstname,branch_id,lastname,address,validation } = this.state;
    console.log(email);
    await this.setState({
      validation: {
        ...validation,
        email: email !== '' && email !== undefined,
        phone: phone !== ''&& phone !== undefined,
        address: address !== ''&& address !== undefined,
        password: password !== ''&& password !== undefined,
        firstname: firstname !== ''&& firstname !== undefined,
        lastname: lastname !== ''&& lastname !== undefined,
        branch_id: branch_id !== ''&& branch_id !== undefined,


      },
    });
    console.log(Object.values(this.state.validation).every(Boolean))
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveUser();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
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
      );
    }
  };

  saveUser = () => {
    this.setState({ saving: true });

    const {firstname,lastname,phone,password,address,email,branch_id} =this.state;
    let data = new FormData();
    data.set("email", email);
    data.set("firstname", firstname);
    data.set("password", password);
    data.set("lastname", lastname);
    data.set("phone", phone);
    data.set("branch_id", branch_id);
    data.set("address", address);
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
        console.log(res.data);
        this.setState({ saving: false, edit: false });
        this.props.saved();
        this.props.toggle();
        toast("User created");
        //return <Redirect to={{ pathname: '/auth/login', state: { from: props.location } }} />
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errorMessage: err.response.data,
          show: true,
        });
        if (this.state.errorMessage) {
            toast.dismiss();
            toast.configure({ hideProgressBar: true, closeButton: false });
          toast("Could not save user");
        }
        this.setState({ saving: false });
      });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };
  filterBranches = (inputValue) => {
    return this.state.branches.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  
  loadBranches = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterBranches(inputValue));
    }, 1000);
  };

  onChange2 = (e, state) => {
    this.setState({ [state]: e });
  };

  
  render() {
    const { addUser, products, toggle } = this.props;
    const { loading, branches,  saving, validation } =this.state;
    return (
      <>
        <Modal
         className="modal-dialog-centered"
          isOpen={addUser != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 800 }}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
                <h5 className="modal-title" id="exampleModalLabel">
                Add user
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
                  <Row>
                    <Col md={9}>
                      
                    </Col> 
                  </Row>
                  <Row>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>First Name</Form.Label>

                    <Form.Control
                      id="state"
                      type="text"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "firstname");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />
                  </Form.Group>
                  
                    </Col>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>Last Name</Form.Label>

                    <Form.Control
                      id="state"
                      type="text"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "lastname");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />
                  </Form.Group>
                  
                    </Col>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>Address</Form.Label>

                    <Form.Control
                      id="state"
                      type="text"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "address");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />
                  </Form.Group>
                  
                    </Col>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>Phone</Form.Label>

                    <Form.Control
                      id="state"
                      type="text"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "phone");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />
                  </Form.Group>
                  
                    </Col>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>

                    <Form.Control
                      id="state"
                      type="text"
                      required
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
                    <Col md={6}>
                    <Form.Label>Assign Branch to user</Form.Label>
                    <AsyncSelect
                          cacheOptions
                          defaultOptions
                          loadOptions={this.loadBranches}
                          onInputChange={this.handleInputChange}
                          onChange={async (property, value) => {
                            console.log(property);
                            await this.setState({
                              branch_id: property.value,
                              selectedTitle: property.label,
                            });
                          }}
                        />
                    </Col>
                    <Col md={6}>
                    
                    <Form.Group className="mb-2">
                    <Form.Label>Password</Form.Label>

                    <Form.Control
                      id="state"
                      type="password"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "password");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    />
                  </Form.Group>
                  
                    </Col>
                  </Row>
                </Col>
                
                
                <div className="mt-3">
                  <div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      onClick={this.onSaveUser}
                    >
                      create user
                    </Button>
                  </div>
                </div>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default AddUser;
