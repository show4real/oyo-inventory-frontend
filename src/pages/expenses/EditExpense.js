import React, { Component } from "react";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { updateExpense, getClients } from "../../services/creditorService";
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
import { CardHeader, Media, Input, Modal } from "reactstrap";
import { InputNumber, Button } from 'antd';
export class EditExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      expense:props.expense,
      edit:false
    };
  }
  onChange = (e, state) => {
    const { expense } = this.state

    this.setState({ expense: { ...expense, [state]: e } })
  }

  onSaveExpense = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { expense, validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        amount_paid: expense.amount_paid !== "",
        payment_mode: expense.payment_mode !== "",
        receiver: expense.receiver !== "",
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveExpense();
    } else {
      const errors = Object.keys(this.state.validation).filter((id) => {
        return !this.state.validation[id];
      });
      //await toast.configure({hideProgressBar: true, closeButton: false});
      toast.dismiss();
      toast.configure({ hideProgressBar: true, closeButton: false });
          toast(
            <div style={{ padding: "10px 20px" }}>
              <p style={{ margin: 0, fontWeight: "bold",color:"red" }}>Errors:</p>
              {errors.map((v) => (
                <p key={v} style={{ margin: 0, fontSize: 14,color:"red" }}>
                  * {this.validationRules(v)}
                </p>
              ))}
            </div>
          )
        
    }
  };

 

  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };

 

  

  validationRules = (field) => {
    if (field === "amount_paid") {
      return "Amount received field is required";
    }
  };

  saveExpense = () => {
    this.setState({ loading: true });

    const { expense } = this.state;
   
  
    //console.log(amount_paid);
    updateExpense({
      id: expense.id,
      receiver: expense.receiver,
      amount_paid: expense.amount_paid,
      payment_mode: expense.payment_mode,
      description: expense.description,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false });
        this.props.toggle();
        this.props.saved();
        this.showToast("Expense Updated");

      }).catch((err) => {
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

  showToast = (msg) => {
    toast(<div style={{ padding: 20}}>{msg}</div>);
  };

  formatCurrency(x){
    if(x!==null && x!=='0' && x!==undefined){
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")}`;
    }
    return '0';
}



  render() {
    const { toggle } = this.props;
    const {

      saving,
      validation,
      loading,
      expense,
      edit
    } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={expense}
          toggle={() => !loading && toggle}
        >
          {loading && <SpinDiv text={"loading..."} />}
          {saving && <SpinDiv text={"saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
            <Button
                variant={edit ? "secondary" : "primary"}
                onClick={this.toggleEdit}
                size="sm"
              >
                {edit ? "Discard Changes" : "Edit Expense"}
              </Button>
              
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
                    <Form.Label>Amount Spent</Form.Label>
                    <InputNumber
                                                
                        style={{width:200, height:40, paddingTop:5, borderRadius:5, fontSize:18}}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          disabled={!edit}
                        value={expense.amount_paid}
                        onChange={e=>this.onChange(e, 'amount_paid')}
                      />
                  </Form.Group>
                </Col>
                <Col md={6} style={{ marginBottom: 20, }}>
                  <Form.Group className="mb-2">
                    <Form.Label>Mode of Payment</Form.Label>

                    <Form.Select
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "payment_mode");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                      disabled={!edit}
                      value={expense.payment_mode}
                    >
                      <option value="">Select Mode of Payment</option>
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12} className="mb-3">
                  <Form.Group id="Name">
                    <Form.Label>Description</Form.Label>
                    <Input
                      disabled={!edit}
                      style={{ height: 140, paddingTop: 5, borderRadius: 5, fontSize: 18 }}
                      type='textarea'
                      value = {expense.description}
                      placeholder=""
                      onChange={e => this.onChange(e.target.value, 'description')}
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
                      onClick={this.onSaveExpense}
                    >
                      Update Expense
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

export default EditExpense;
