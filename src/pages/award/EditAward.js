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
import { faEnvelope, faPhone, faLock, faPencilAlt, faAddressCard, faUnlockAlt, faEyeSlash, faEye, faLocationArrow, faPiggyBank } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addAward, editAward} from "../../services/awardService";
import AsyncSelect from "react-select/async";
import ReactDatetime from "react-datetime";
import moment from "moment"

export class EditAward extends Component {
  constructor(props) {
    super(props);
    this.state = {
    
      employees: props.employees,
      award_types:props.award_types,
      dated: moment().startOf('month'),
      id: props.award.id,
      award: props.award

    };
  }

  componentDidMount() {
    toast.configure({ hideProgressBar: true, closeButton: false });
   
  }

 
  dateFilter = async (e, state) => {
    await this.setState({ [state]: e })
  }

  onSaveAward = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {description, title, award_type_id, gift, dated, employee_id}=this.state.award;
    const {  validation } = this.state;
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




  saveAward = () => {
    this.setState({ saving: true });
    const { award, id } = this.state;
    console.log();
    editAward({
      employee_id: award.employee_id,
      award_type_id: award.award_type_id,
      description: award.description,
      gift: award.gift,
      title: award.title,
      id: id,
      dated: award.dated,

    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false, saving:false });
        this.props.saved();
        this.props.toggle();
        this.showToast("Award has been updated");
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

  

  showToast = msg => {
    toast(<div style={{ padding: 20, color: "green" }}>{msg}</div>);
  }
  showToastError = (msg) => {
    toast(<div style={{ padding: 20, color: "red" }}>{msg}</div>);
  };

  onChange = (e, state) => {
    const { award } = this.state

    this.setState({ award: { ...award, [state]: e } })
  }

  

  toggleEdit = () => {
    this.setState({ edit: !this.state.edit });
  };






  render() {

    const { toggle } = this.props;

    const { saving, edit, award, employees,award_types, loading } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-top"
          isOpen={award != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {saving && <SpinDiv text={"Saving..."} />}
          {loading && <SpinDiv text={"loading..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <ButtonGroup>
                {award && (

                  <Button color={edit ? "secondary" : "success"}
                    onClick={this.toggleEdit}
                    size="sm" variant="outline-primary">
                    {edit ? "Discard Changes" : "Edit Award"}



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
              <Col md={12} style={{ paddingTop: 15 }}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ paddingRight: 10 }}>Award Title</Form.Label>
                    <Input
                      className="custom-control-input"
                      id="title"
                      placeholder='Enter Title'
                      value={award.title}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "title");
                      }}
                      type="text"
                    />
                  </Form.Group>

                </Col>
              </Row>
              <Row>
              <Col md={6} >
                  <Form.Group className="mb-2">
                    <Form.Label>Employee</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={award.employee_id}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "employee_id");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >

                      <option value="">Select Employee</option>
                      {employees.length == 0 && <option value="">loading</option>}
                      {employees.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                </Col>
                <Col md={6} >
                  <Form.Group className="mb-2">
                    <Form.Label>Award Type</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={award.award_type_id}
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
                     value={moment(award.dated).format('MMM DD, YYYY') || ''}
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
                      id="gift"
                      placeholder=''
                      value={award.gift}
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
                      value={award.description}
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

export default EditAward;
