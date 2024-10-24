import React, { Component } from "react";
import { CardHeader, Media, Input, Modal } from "reactstrap";
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
import ReactTagInput from "@pathofdev/react-tag-input";
//import "@pathofdev/react-tag-input/build/index.css";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addBranches } from "../../services/branchService";

export class AddBranches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      tags: [],
    };
    this.onTagsChanged = this.onTagsChanged.bind(this);
  }

  onTagsChanged(tags) {
    this.setState({ tags });
  }

  onSaveBranches = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { tags, validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        name: tags.length !==0,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveBranch();
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

  validationRules = (field) => {
    if (field === "name") {
      return "Tag is required";
    }
  };

  saveBranch = () => {
    this.setState({ loading: true });
    const { tags, attributes } = this.state;
    console.log();
    addBranches({
      name: tags,
    }).then(
      (res) => {
        console.log(res);
        this.setState({ loading: false });
        this.props.saved();
        this.props.toggle();
        this.showToast("Branches has been created");
      },
      (error) => {
        console.log(error);
        this.setState({ loading: false });
      }
    );
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  render() {
    const { addBranches, toggle } = this.props;

    const { saving, loading, tags } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addBranches != null}
          toggle={() => !loading && !saving && toggle}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
             <h5>Create Branches</h5>
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
                <ReactTagInput
                  tags={tags}
                  onChange={this.onTagsChanged}
                  style={{ borderRadius: "4px;" }}
                  placeholder="Type an option and press enter"
                />
              </Row>
              <Row style={{ marginTop: "10px" }}>
                <Col md={12}>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ marginTop: "10px", float: "right" }}
                      disabled={saving}
                      onClick={this.onSaveBranches}
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

export default AddBranches;
