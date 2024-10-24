import React, { Component } from "react";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addClient, getClients } from "../../services/invoiceService";
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
import { CardHeader, Media, Input, Modal } from "reactstrap";
export class AddClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      address: "",
      phone: "",
      email: "",
      name: "",
      company_name: "",
    };
  }
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  componentDidMount() {}

  onSaveClient = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { name, address, phone, email, validation, company_name } =
      this.state;
    await this.setState({
      validation: {
        ...validation,
        name: name !== "",
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
      );
    }
  };

  validationRules = (field) => {
    if (field === "name") {
      return "Name field is required";
    }
  };

  saveClient = () => {
    this.setState({ loading: true });
    const { history } = this.props;
    const { name, company_name, phone, email, address } = this.state;
    console.log();
    addClient({
      name: name,
      company_name: company_name,
      email: email,
      phone: phone,
      address: address,
    })
      .then((res) => {
        console.log(res);
        this.setState({ loading: false });

        this.props.saved();
        this.props.toggle();
        this.showToast("Client saved");
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errorMessage: err,
          show: true,
        });
        if (this.state.errorMessage) {
          this.showToast(this.state.errorMessage);
        }
        this.setState({ saving: false });
      });
  };

  onClose = (e) => {
    console.log(e, "I was closed.");
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  render() {
    const { addClient, toggle } = this.props;
    const {
      name,
      company_name,
      email,
      phone,
      address,
      saving,
      validation,
      loading,
    } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addClient}
          toggle={() => !loading && toggle}
        >
          {loading && <SpinDiv text={"loading..."} />}
          {saving && <SpinDiv text={"saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5>New Client </h5>
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
                <Col md={6} className="mb-3">
                  <Form.Group id="Name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      placeholder="Enter Name"
                      type="text"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "name");
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "email");
                      }}
                      placeholder="Enter Client Email"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group id="phone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="number"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "phone");
                      }}
                      placeholder="Enter Client Phone"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="phone">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="textarea"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "address");
                      }}
                      placeholder="Enter Address"
                    />
                  </Form.Group>
                </Col>
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
                      Save Client
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

export default AddClient;
