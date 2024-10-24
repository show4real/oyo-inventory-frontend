import React, { Component } from "react";
import { FormGroup, CardHeader, Media, Input, Modal } from "reactstrap";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  ButtonGroup,

} from "@themesberg/react-bootstrap";
import "@pathofdev/react-tag-input/build/index.css";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addAward } from "../../services/awardService";
import AsyncSelect from "react-select/async";
import ReactDatetime from "react-datetime";
import moment from "moment";

export class AddAward extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      title: '',
      award_types:props.award_types,
      employees: props.employees.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
      start_date: moment().startOf('month'),
      end_date: moment().endOf('month')
    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
   
  }

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };


  getEmployees = (inputValue) => {

    return this.state.employees.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };
  loadEmployees = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.getEmployees(inputValue));
    }, 1000);
  };

  



  onSaveAward = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { title, dated, award_type_id,gift, description, employee_id, validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        employee_id: employee_id !== '' && employee_id !== undefined,
        gift: gift !== '' && gift !== undefined,
        award_type_id: award_type_id !== '' && award_type_id !== undefined,
        dated: dated !== '' && dated !== undefined,
        description: description !== '' && description !== undefined,
        title: title !== '' && title !== undefined,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveAward();
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
    if (field === "employee_id") {
      return "Employee Name  is required";
    } else if (field == 'award_type_id') {
      return "Award type is required"
    } else if (field == 'dated') {
      return "Date created is required"
    } else if (field == 'description') {
      return "Description is required"
    }else if (field == 'title') {
      return "Title is required"
    }
  };

  dateFilter = async (e, state) => {
    await this.setState({ [state]: e })

  }

  saveAward = () => {
    this.setState({ saving: true });
    const {  title, dated, award_type_id,gift, description, employee_id, } = this.state;
    console.log();
    addAward({
      employee_id: employee_id,
      award_type_id: award_type_id,
      title: title,
      dated: dated,
      gift: gift,
      description: description,


    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false });
        this.props.saved();
        this.props.toggle();
        this.showToast("Award has been created");
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

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  render() {
    const { employees, toggle } = this.props;

    const { saving,  title, dated, award_types, award_type_id,gift, description, employee_id, loading } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={employees != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {loading && <SpinDiv text={"loading..."} />}
          {saving && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5>Create Award</h5>
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
                    <Form.Label style={{ paddingRight: 10 }}>Award Title</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="title"
                      placeholder='Enter Title'
                      value={title}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "title");
                      }}
                      type="text"
                    />
                  </Form.Group>

                </Col>
              </Row>
              <Row>
                <Col md={6}>

                  <Form.Group>
                    <Form.Label>Choose Employee</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      loadOptions={this.loadEmployees}
                      onInputChange={this.handleInputChange}
                      onChange={async (property, value) => {
                        console.log(property);
                        await this.setState({
                          employee_id: property.value,
                          selectedEmployee: property.label,
                        });
                      }}
                    />
                  </Form.Group>

                </Col>
                <Col md={6} >
                  <Form.Group className="mb-2">
                    <Form.Label>Award Type</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={award_type_id}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "award_type_id");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >

                      <option value="">choose Award Type</option>
                      {award_types.length == 0 && <option value="">loading</option>}
                      {award_types.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                </Col>

              </Row>
              
              <Row>
                <Col md="6">
                  <FormGroup className="form-date">
                    <label
                      className="form-control-label"
                      htmlFor="input-address"
                    >
                      Date Created
                    </label>
                    <ReactDatetime
                      value={dated}
                      dateFormat={'MMM D, YYYY'}
                      closeOnSelect
                      onChange={e => this.dateFilter(e, 'dated')}
                      inputProps={{
                        required: true,
                        className: 'form-control date-width'
                      }}
                      timeFormat={false}
                    />
                  </FormGroup>
                </Col>
                <Col md={6} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Gift</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="title"
                      placeholder=''
                      value={gift}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "gift");
                      }}
                      type="text"
                    />
                  </Form.Group>

                </Col>
                
              </Row>

              <Row>
                <Col md={6} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Description</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="reason"
                      placeholder='Enter Description'
                      value={description}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "description");
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
                      onClick={this.onSaveAward}
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

export default AddAward;
