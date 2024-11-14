import React, { Component } from "react";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import { Col, Row, Form } from "@themesberg/react-bootstrap";
import { Button, InputNumber } from "antd";
import { moreOrder } from "../../services/purchaseOrderService";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";

export class AddMoreOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      loading: false,
      unit_order: 0,
      id: props.stock.id,
      submitted: false,
    };
  }

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  onSave = async () => {
    await toast.dismiss();
    const { unit_order } = this.state;
    this.setState({ submitted: true });
    let check_order = unit_order == 0;

    if (check_order == 0 || check_order == "") {
      this.saveOrder();
    } else {
      this.setState({ loading: false, saving: false });
    }
  };

  saveOrder = async () => {
    await toast.dismiss();
    this.setState({ saving: true });

    const { unit_order, id } = this.state;
    this.setState({ saving: true });
    moreOrder({
      quantity: unit_order,
      id: id,
    }).then(
      (res) => {
        this.setState({ loading: false, saving: false });
        this.showToast("Order has been updated");
        this.props.toggle();
      },
      (error) => {
        this.setState({ loading: false, saving: false });
        alert("Order Could not be saved checK network");
      }
    );
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  };

  render() {
    const { stock, toggle } = this.props;

    const { saving, submitted, unit_order, loading } = this.state;
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
            <h5>Add More Quantity to Order</h5>

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
                    <Form.Label>Quantity</Form.Label>
                    <InputNumber
                      value={unit_order}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      onChange={(e) => this.onChange(e, "unit_order")}
                    />
                  </Form.Group>
                  {submitted && !unit_order && (
                    <div style={{ color: "red" }}>
                      Order Quantity is required
                    </div>
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

export default AddMoreOrder;
