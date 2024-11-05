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
import { Button } from "antd";
import { editPrice } from "../../services/purchaseOrderService";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";

export class EditPrice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      loading: false,
      unit_selling_price: props.stock.unit_selling_price,
      unit_price: props.stock.unit_price,
      id: props.stock.id,
      submitted: false,
    };
  }

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onSave = async () => {
    await toast.dismiss();
    const { unit_selling_price, unit_price } = this.state;
    this.setState({ submitted: true });
    let check_price = unit_price == "" || null ? false : true;
    let check_selling_price = unit_selling_price == "" || null ? false : true;

    if (check_price && check_selling_price) {
      this.savePrice();
    } else {
      this.setState({ loading: false, saving: false });
    }
  };

  savePrice = async () => {
    await toast.dismiss();
    this.setState({ saving: true });

    const { unit_selling_price, unit_price, id } = this.state;
    this.setState({ saving: true });
    editPrice({
      unit_selling_price: unit_selling_price,
      unit_price: unit_price,
      id: id,
    }).then(
      (res) => {
        this.setState({ loading: false, saving: false });
        this.showToast("Selling Price has been updated");
        this.props.toggle();
      },
      (error) => {
        this.setState({ loading: false, saving: false });
        alert("Please set selling price");
      }
    );
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };

  render() {
    const { stock, toggle } = this.props;

    const { saving, submitted, unit_selling_price, unit_price, loading } =
      this.state;
    return (
      <>
        {saving && <SpinDiv text={"Saving..."} />}
        {loading && <SpinDiv text={"loading..."} />}
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={stock != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 500 }}
        >
          <div className="modal-header" style={{ padding: "1rem" }}>
            <h5>Edit Prices</h5>

            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
          <Row>
            <Col md={12}>
              <Row style={{ marginBottom: 10 }}>
                <Col md={2}></Col>
                <Col md={6}>
                  <Col md={3}></Col>
                  <Form.Group>
                    <Form.Label>Cost Price</Form.Label>
                    <Input
                      value={unit_price}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "unit_price");
                      }}
                    />
                  </Form.Group>
                  {submitted && !unit_price && (
                    <div style={{ color: "red" }}>Cost Price is required</div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={2}></Col>
                <Col md={6}>
                  <Col md={3}></Col>
                  <Form.Group>
                    <Form.Label>Selling Price</Form.Label>
                    <Input
                      value={unit_selling_price}
                      onChange={async (e) => {
                        await this.onChange(
                          e.target.value,
                          "unit_selling_price"
                        );
                      }}
                    />
                  </Form.Group>
                  {submitted && !unit_selling_price && (
                    <div style={{ color: "red" }}>stock is required</div>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col md={8}></Col>
            <Col md={3} style={{ marginBottom: 10 }}>
              <Button
                onClick={() => {
                  this.onSave();
                }}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

export default EditPrice;
