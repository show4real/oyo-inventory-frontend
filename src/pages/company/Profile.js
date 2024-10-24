import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import {
  Col,
  Row,
  Form,
  ButtonGroup,
  Card,
  Image,
  Spinner,
  Button,
  Container,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import Profile1 from "../../assets/img/team/profile-picture-1.jpg";
import ProfileCover from "../../assets/img/profile-cover.jpg";
import { toast } from "react-toastify";
import moment from "moment";
import { addCompanyProfile, getCompany } from "../../services/companyService";
import ReactDatetime from "react-datetime";
import SpinDiv from "../components/SpinDiv";
import {
  faEnvelope,
  faPhone,
  faLock,
  faPencilAlt,
  faAddressCard,
  faUnlockAlt,
  faEyeSlash,
  faEye,
  faLocationArrow,
  faPiggyBank,
} from "@fortawesome/free-solid-svg-icons";
import { faDigitalOcean } from "@fortawesome/free-brands-svg-icons";
import Resizer from "react-image-file-resizer";
import { currencies } from "../invoice/Currency";
export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      company: {},
      loading: false,
      saving: false,
      currencies: currencies,
    };
    this.fileChangedHandler = this.fileChangedHandler.bind(this);
  }

  componentDidMount() {
    this.getCompany();
  }

  getCompany = () => {
    this.setState({ loading: true });
    getCompany().then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          company: res.company,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  onSave = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { validation, company, newImage, imageType, imageSize } = this.state;
    console.log(company.name);
    const {
      name,
      email,
      phone_one,
      phone_two,
      address,
      city,
      country,
      currency,
      invoice_footer_one,
      invoice_footer_two,
      invoice_header,
      website,
    } = company;
    await this.setState({
      validation: {
        ...validation,
        name: name !== "" && name !== undefined,
        email: email !== "" && email !== undefined,
        invoice_header: invoice_header !== "" && invoice_header !== undefined,
        phone_one: phone_one !== "" && phone_one !== undefined,
        currency: currency !== "" && currency !== undefined,
        address: address !== "" && address !== undefined,
        website: website !== "" && website !== undefined,
        invoice_footer_one:
          invoice_footer_one !== "" && invoice_footer_one !== undefined,
        invoice_footer_two:
          invoice_footer_two !== "" && invoice_footer_two !== undefined,
        city: city !== "" && city !== undefined,
        country: country !== "" && country !== undefined,
        // data: newImage !== undefined || newImage === null,
        // imageType: imageType === 'image/jpeg' || imageType === 'image/png',
        // imageSize: imageSize / 1024 / 1024 <= 2
      },
    });

    if (Object.values(this.state.validation).every(Boolean)) {
      this.save();
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
    if (field === "name") {
      return "Name is required";
    } else if (field === "address") {
      return "Address is required";
    } else if (field === "phone_one") {
      return "Phone One is required";
    } else if (field === "email") {
      return "Email is required";
    } else if (field === "website") {
      return "Website Url is required";
    } else if (field === "currency") {
      return "Currency  is required";
    } else if (field === "invoice_footer_one") {
      return "Invoice footer one is required";
    } else if (field === "invoice_header") {
      return "Invoice Header is required";
    } else if (field === "invoice_footer_two") {
      return "Invoice footer two is required";
    } else if (field === "city") {
      return "City Field  is required";
    } else if (field === "country") {
      return "Country is required";
    }
    //else if (field === "data") {
    //   return "Image is required";
    // } else if (field === "imageType") {
    //   return "Image Type is not valid";
    // } else if (field === "imageSize") {
    //   return "Image Size is not valid";
    // }
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  toggleEditCompany = () => {
    this.setState({ editCompany: !this.state.editCompany });
  };

  onChange = (e, state) => {
    const { company } = this.state;
    this.setState({ company: { ...company, [state]: e } });
  };

  fileChangedHandler(event) {
    var fileInput = false;
    if (event.target.files[0]) {
      fileInput = true;
      this.setState({
        imageType: event.target.files[0].type,
        imageSize: event.target.files[0].size,
      });
    }
    if (fileInput) {
      try {
        Resizer.imageFileResizer(
          event.target.files[0],
          300,
          300,
          "JPEG",
          100,
          0,
          (uri) => {
            console.log(uri);
            this.setState({ newImage: uri });
            //this.setState({imageType:event.target.files[0].type})
          },
          "base64",
          200,
          200
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  save = () => {
    this.setState({ saving: true });

    const { company, newImage, validation } = this.state;
    const {
      name,
      email,
      phone_one,
      phone_two,
      address,
      city,
      cashier_daily_filter,
      sell_by_serial_no,
      country,
      currency,
      logo_url,
      invoice_footer_one,
      invoice_footer_two,
      invoice_header,
      website,
    } = company;
    this.setState({ saving: true });

    addCompanyProfile({
      name: name,
      logo_url: logo_url,
      email: email,
      website: website,
      phone_one: phone_one,
      phone_two: phone_two,
      currency: currency,
      address: address,
      invoice_footer_one: invoice_footer_one,
      invoice_footer_two: invoice_footer_two,
      invoice_header: invoice_header,
      address: address,
      city: city,
      country: country,
      cashier_daily_filter: cashier_daily_filter == true ? 1 : 0,
      sell_by_serial_no: sell_by_serial_no == true ? 1 : 0,
      data: newImage === null || undefined ? "" : newImage,
    }).then(
      (res) => {
        console.log(res);
        localStorage.removeItem("company");
        localStorage.setItem("company", JSON.stringify(res.company));
        this.setState({ loading: false, saving: false });
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
          <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "green" }}>
              Company Profile updated
            </p>
          </div>
        );

        this.getCompany();
      },
      (error) => {
        console.log(error);
        this.setState({ saving: false });
        toast(
          <div style={{ padding: "10px 20px" }}>
            <p style={{ margin: 0, fontWeight: "bold", color: "red" }}>
              An error occurred
            </p>
          </div>
        );
      }
    );
  };

  render() {
    const { photo, profile_picture, saving, loading, company, editCompany } =
      this.state;

    return (
      <>
        {loading && <SpinDiv text={"Loading..."} />}
        {saving && <SpinDiv text={"saving..."} />}
        <Row>
          <Col xs={12} xl={8}>
            <Card border="light" className="bg-white shadow-sm mb-4">
              <Row>
                <Col className="text-right" md={12}>
                  <ButtonGroup>
                    <Button
                      variant={editCompany ? "secondary" : "primary"}
                      onClick={this.toggleEditCompany}
                      size="sm"
                    >
                      {editCompany ? "Discard Changes" : "Edit Profile"}
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
              <Card.Body>
                <h5 className="mb-4">General information</h5>
                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="firstName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={company !== null ? company.name : ""}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "name");
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="emal">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={company !== null ? company.email : ""}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "email");
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={company !== null ? company.website : ""}
                        disabled={!editCompany}
                        onChange={async (e) => {
                          await this.onChange(e.target.value, "website");
                        }}
                      />
                    </Col>
                    <Col md={6} style={{ paddingTop: 15 }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ paddingRight: 10 }}>
                          Sell By Serial No
                          <br />
                          <small>Allow Cashier to sell by Serial No</small>
                        </Form.Label>
                        <Input
                          className="custom-control-input"
                          id="sell_by_serial_no"
                          checked={
                            company && company.sell_by_serial_no == 1
                              ? true
                              : false
                          }
                          onChange={async (e) => {
                            await this.onChange(
                              e.target.checked,
                              "sell_by_serial_no"
                            );
                          }}
                          size="md"
                          type="checkbox"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="phone">
                        <Form.Label>Phone One</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={company !== null ? company.phone_one : ""}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "phone_one");
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="phone">
                        <Form.Label>Phone Two</Form.Label>
                        <Form.Control
                          required
                          type="text"
                          value={company !== null ? company.phone_two : ""}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "phone_two");
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Country</Form.Label>

                          <Form.Select
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "country");
                            }}
                            value={company == null ? "" : company.country}
                            disabled={!editCompany}
                            style={{
                              marginRight: 10,
                              width: "100%",
                            }}
                          >
                            <option value="">Select Country</option>
                            {currencies.length == 0 && ""}
                            {currencies.map((p, index) => (
                              <option value={p.name} key={p}>
                                {p.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group id="emal">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            value={company == null ? "" : company.city}
                            disabled={!editCompany}
                            onChange={async (e) => {
                              await this.onChange(e.target.value, "city");
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  }
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="address">
                        <Form.Label>Address</Form.Label>

                        <Input
                          required
                          type="textarea"
                          rows={5}
                          value={company == null ? "" : company.address}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "address");
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label>Currency</Form.Label>

                        <Form.Select
                          onChange={async (e) => {
                            await this.onChange(e.target.value, "currency");
                          }}
                          value={company == null ? "" : company.currency}
                          disabled={!editCompany}
                          style={{
                            marginRight: 10,
                            width: "100%",
                          }}
                        >
                          <option value="">Select Currency</option>
                          {currencies.length == 0 && ""}
                          {currencies.map((p, index) => (
                            <option value={p.abbrev} key={p}>
                              {p.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Col md={3} style={{ paddingTop: 15 }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ paddingRight: 10 }}>
                            Cashier Daily Filter
                            <small>Allow Cashier to see all Sales</small>
                          </Form.Label>
                          <Input
                            className="custom-control-input"
                            id="cashier_daily_filter"
                            bsSize
                            checked={
                              company && company.cashier_daily_filter == 1
                                ? true
                                : false
                            }
                            onChange={async (e) => {
                              await this.onChange(
                                e.target.checked,
                                "cashier_daily_filter"
                              );
                            }}
                            type="checkbox"
                          />
                        </Form.Group>
                      </Col>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group id="invoice_footer_two">
                        <Form.Label>
                          Invoice Header title one
                          <small>
                            Ex:Sales of Laptops, Phones and Accessories!
                          </small>
                        </Form.Label>

                        <Input
                          required
                          type="textarea"
                          rows={5}
                          value={company == null ? "" : company.invoice_header}
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(
                              e.target.value,
                              "invoice_header"
                            );
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group id="invoice_footer_one">
                        <Form.Label>
                          Invoice Footer title one
                          <small>Ex:Thanks for your Patronage!</small>
                        </Form.Label>

                        <Input
                          required
                          type="textarea"
                          rows={5}
                          value={
                            company == null ? "" : company.invoice_footer_one
                          }
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(
                              e.target.value,
                              "invoice_footer_one"
                            );
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group id="invoice_footer_two">
                        <Form.Label>
                          Invoice Footer title one
                          <small>Ex:Terms and Condition!</small>
                        </Form.Label>

                        <Input
                          required
                          type="textarea"
                          rows={5}
                          value={
                            company == null ? "" : company.invoice_footer_two
                          }
                          disabled={!editCompany}
                          onChange={async (e) => {
                            await this.onChange(
                              e.target.value,
                              "invoice_footer_two"
                            );
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <div className="d-xl-flex align-items-center">
                        <img src={this.state.newImage} alt="" />
                        <div className="company-avatar xl-avatar">
                          <Image
                            fluid
                            rounded
                            src={
                              company && company.logo_url !== null
                                ? company.logo_url
                                : photo
                            }
                          />
                        </div>
                        <div className="file-field">
                          <div className="d-flex justify-content-xl-center ms-xl-3">
                            <div className="d-flex">
                              <span className="icon icon-md">
                                <FontAwesomeIcon
                                  icon={faPaperclip}
                                  className="me-3"
                                />
                              </span>

                              <input
                                type="file"
                                onChange={this.fileChangedHandler}
                              />
                              <div className="d-md-block text-start">
                                <div className="fw-normal text-dark mb-1">
                                  Choose Image
                                </div>
                                <div className="text-gray small">
                                  JPG, GIF or PNG. Max size of 800K
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {editCompany && (
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                        onClick={this.onSave}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}

export default Profile;
