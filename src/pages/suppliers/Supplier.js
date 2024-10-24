import React, { Component } from "react";

import { ChoosePhotoWidget, ProfileCardWidget } from "../../components/Widgets";
import { getProduct } from "../../services/productService";
import AttributeOptions from "../products/AttributeOptions";
import { toast } from "react-toastify";
import {
  Col,
  Row,
  Card,
  Table,
  Form,
  Button,
  ButtonGroup,
} from "@themesberg/react-bootstrap";
import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import { getSupplier} from "../../services/supplierService";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";

export class Supplier extends Component {
  constructor(props) {
    super(props);
    const { location: state } = props;

    this.state = {
      loading: false,
      edit: false,
      change: false,
      supplier: state && state.supplier ? state.supplier : null,
      validation: {},
      id: props.match.params.id,
    };
  }

  componentDidMount() {
    this.getSupplier();
  }

  getSupplier = () => {
    const { id } = this.state;

    this.setState({ loading: true });
    getSupplier(id).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          supplier: res.supplier,
          initialSupplier: { ...res.supplier },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  toggleEdit = () => {
    const { initialSupplier } = this.state;
    this.setState({ edit: !this.state.edit, supplier: { ...initialSupplier } });
  };


  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  onChange = (e, state) => {
    console.log(e);
    const { supplier } = this.state;

    this.setState({ supplier: { ...supplier, [state]: e } });
  };

  onUpdateSupplier = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { supplier,validation } =this.state;
    const {country,city,name,street_address,state,zip,email,phone,description}=supplier;
      console.log(country);
    await this.setState({
      validation: {
        ...validation,
        country: country !== '',
        phone: phone !== '',
        email:  email !== '',
        name:  name !== '',
        state:  state !== '',
        city:  city !== '',
        description:  description!== '',
        street_address:  street_address!== '',
        zip:  zip!== "",
        
      },
    });
    console.log(this.state.validaton)
    if (Object.values(this.state.validation).every(Boolean)) {
        this.saveSupplier();
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

  
  validationRules = (field) => {
    if (field === "country") {
      return "country is required";
    } else if (field === "city") {
      return "city is required";
    } else if (field === "description") {
      return "description is required";
    } else if (field === "name") {
      return "name is required";
    } else if (field === "zip") {
      return "zip is required";
    } else if (field === "street_address") {
      return "street Address is required";
    }else if (field === "state") {
        return "state is required";
      }else if (field === "email") {
        return "Email is required";
      }else if (field === "phone") {
        return "Phone is required";
      }
  };

  
  
  saveSupplier = () => {
    this.setState({ saving: true });

    const { supplier, id } = this.state;
    const {country,city,name,street_address,state,zip,email,phone,description}=supplier;
    
    let data = new FormData();
    
    data.set("country", supplier.country);
    data.set("city", supplier.city);
    data.set("street_address", supplier.street_address);
    data.set("name", supplier.name);
    data.set("email", supplier.email);
    data.set("description", supplier.description);
    data.set("phone", supplier.phone);
    data.set("zip", supplier.zip);
    data.set("state", supplier.state);
    return axios
      .post(
        `${settings.API_URL}updatesupplier/${id}`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ saving: false, edit: false });
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
            <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "green" }}>Supplier updated</p>
            
            </div>
        );
        this.getSupplier(id);

      
      })
      .catch((err) => {
        console.log(err.name);
        this.setState({
          errorMessage: err.response.data,
          show: true,
        });
        console.log(this.state.errorMessage.name);
        const {errorMessage}=this.state;
        if (errorMessage.name) {
            const errorname = errorMessage.name.map((name,key)=>{
                return name;
            })
            toast.dismiss();
                toast.configure({ hideProgressBar: true, closeButton: false });
                toast(
                    <div style={{ padding: "10px 20px" }}>
                    <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>{errorname}</p>
                    
                    </div>
                );
            
        }
        if (errorMessage.email) {
            const erroremail = errorMessage.email.map((name,key)=>{
                return name;
            })
            toast.dismiss();
                toast.configure({ hideProgressBar: true, closeButton: false });
                toast(
                    <div style={{ padding: "10px 20px" }}>
                    <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>{erroremail}</p>
                    
                    </div>
                );
            
        }
        this.setState({ saving: false });
      });
  };

  

  

  render() {
    const {
      product,
      supplier,
      validation,
      addSupplier,
      saving,
      loading,
      edit,
    } = this.state;
    const Required = () => <span style={{ color: "red" }}>*</span>;
    return (
      <>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
          <div className="d-flex">
           
          </div>
        </div>

        {supplier && (
          <Row>
            <Col xs={12} xl={7}>
              <Row>
                <Card border="light" className="bg-white shadow-sm mb-4">
                  <Card.Body>
                    <Row>
                      {saving && <SpinDiv text={"Saving..."} />}
                      <Col md={12} className="mb-3">
                        <Row>
                          <Col className="text-right" md={12}>
                            {supplier && (
                              <Button
                                variant={edit ? "secondary" : "primary"}
                                onClick={this.toggleEdit}
                                size="sm"
                              >
                                {edit ? "Discard Changes" : "Edit supplier"}
                              </Button>
                            )}
                          </Col>
                        </Row>
                        <Row>
                          <Col md={9}>
                            <Form.Group id="lastName">
                              <Form.Label>Supplier Name</Form.Label>

                              <Form.Control
                                required
                                type="text"
                                value={supplier.name}
                                disabled={!edit}
                                onChange={async (e) => {
                                    await this.onChange(e.target.value, "name");
                                  }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>Supplier ID</Form.Label>

                          <Form.Control
                            type="text"
                            disabled
                            value={supplier.supplier_id}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>Country</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            placeholder="country"
                            value={supplier.country==null?supplier.country ='':supplier.country}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "country");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>City</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.city==null?supplier.city ='':supplier.city}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "city");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>State</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.state==null?supplier.state ='':supplier.state}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "state");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>zip</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.zip==null?supplier.zip ='':supplier.zip}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "zip");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>Email</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.email==null?supplier.email ='':supplier.email}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "email");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>Phone</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.phone==null?supplier.phone ='':supplier.phone}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "phone");
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="lastName">
                          <Form.Label>Street Address</Form.Label>

                          <Form.Control
                            type="text"
                            disabled={!edit}
                            value={supplier.street_address==null?supplier.street_address ='':supplier.street_address}
                            onChange={async (e) => {
                              await this.onChange(
                                e.target.value,
                                "street_address"
                              );
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group id="lastName">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              disabled={!edit}
                              value={supplier.description==null?supplier.description ='':supplier.description}
                              onChange={async (e) => {
                                await this.onChange(
                                  e.target.value,
                                  "description"
                                );
                              }}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="mt-3">
                        {edit && (
                          <div>
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={saving}
                              onClick={this.onUpdateSupplier}
                            >
                              Save Supplier
                            </Button>
                          </div>
                        )}
                      </div>
                    </Row>
                  </Card.Body>
                </Card>
              </Row>
            </Col>
          </Row>
        )}
      </>
    );
  }
}

export default Supplier;
