import React, { Component } from "react";
import SpinDiv from "../components/SpinDiv";
import { toast } from "react-toastify";
import { addProduct } from "../../services/productService";
import AddCategories from "./AddCategories";
import { toggleAddCategory } from "./AddCategories";
import { AsyncPaginate } from "react-select-async-paginate";
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
import { getcategories } from "../../services/categoryService";
// import { getbrands } from "../../services/brandService";
export class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      //brand_id: "",
      category_id: 1,
      description: "",
      product_name: "",
      categories: [],
      // brands:[],
    };
  }
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  componentDidMount() {
    this.getCategories();
    // this.getBrands();
  }

  onSaveProduct = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const { category_id, product_name, brand_id, description, validation } =
      this.state;
    await this.setState({
      validation: {
        ...validation,
        product_name: product_name !== "",
        category_id: category_id !== "",
        // brand_id: brand_id !== "",
        //description: description !== "",
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveProduct();
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
  getCategories = () => {
    getcategories().then(
      (res) => {
        this.setState({
          categories: res.categories.data,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  // getBrands = () => {
  //   getbrands().then(
  //     (res) => {
  //       this.setState({
  //         brands:res.brands.data,
  //       });
  //     },
  //     (error) => {
  //       this.setState({ loading: false });
  //     }
  //   );
  // };

  validationRules = (field) => {
    // if (field === "brand_id") {
    //   return "brand field is required";
    // } else
    if (field === "category_id") {
      return "Category field is required";
    } else if (field === "description") {
      return "Desecription is required";
    } else if (field === "product_name") {
      return "product name is required";
    }
  };

  saveProduct = () => {
    this.setState({ loading: true });
    const { history } = this.props;
    const { category_id, product_name, description } = this.state;
    console.log();
    addProduct({
      category_id: category_id,
      product_name: product_name,
      // brand_id: brand_id,
      description: description,
    })
      .then((res) => {
        console.log(res);
        this.setState({ loading: false });
        this.props.toggle();
        this.props.saved();
        this.showToast("Product saved");
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

  showToast = (msg) => {
    toast(<div style={{ padding: 20 }}>{msg}</div>);
  };

  render() {
    const { addProduct, toggle } = this.props;
    const {
      category_id,
      product_name,
      // brand_id,
      description,
      saving,
      validation,
      loading,
      categories,
      //brands
    } = this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addProduct}
          toggle={() => !loading && toggle}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
              <h5> Create Product </h5>
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
                  <Form.Group id="firstName">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      value={product_name}
                      required
                      type="text"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "product_name");
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group id="lastName">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      required
                      type="textarea"
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "description");
                      }}
                      value={description}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col lg="10">
                  <Form.Group className="mb-2">
                    <Form.Label>Category</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={category_id}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "category_id");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >
                      <option value="">choose category</option>
                      {categories.length == 0 && (
                        <option value="">loading</option>
                      )}
                      {categories.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {/* <Row>
                <Col lg="10">
                  <Form.Group className="mb-2">
                    <Form.Label>Brand</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      value={brand_id}
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "brand_id");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >
                      <option value="">choose Brand</option>
                      {brands.map((p, index) => (
                        <option value={p.id} key={p}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row> */}

              <Row style={{ marginTop: "10px" }}>
                <Col md={12}>
                  <div>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ marginTop: "10px", float: "right" }}
                      disabled={saving}
                      onClick={this.onSaveProduct}
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

export default AddProduct;
