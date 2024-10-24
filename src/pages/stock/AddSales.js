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
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { Route, Redirect } from 'react-router-dom';
import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { toast } from "react-toastify";
import { filterAttributes } from "../../services/purchaseOrderService";
import { CardHeader, Media, Input, Modal } from "reactstrap";
import { quantity } from "chartist";
export class AddSales extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      stock:localStorage.getItem("cart"),
      selectedTitle: "",
      inputValue: "",
      product_id: "",
      rows: 10,
      loading: false,
      tags: [],
      attributes: [],
      validation: {},
      products: props.products.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
      suppliers:props.suppliers.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
      branches:props.branches.map((opt) => ({
        label: opt.name,
        value: opt.id,
      })),
    };
  }
  toggleEdit = () => {
    const { initialProduct } = this.state;
    this.setState({ edit: !this.state.edit, stock: { ...initialProduct } });
  };

  validationRules = (field) => {
    if (field === "stock_quantity") {
      return "stock quantity is required";
    } else if (field === "unit_price") {
      return "Unit price is required";
    } else if (field === "supplier") {
      return "supplier is required";
    } else if (field === "branch_id") {
    return "Branch is required";
  }
  };

  searchTitles = async (movieTitle) => {
    console.log(this.state.products);
    const compare = this.state.products.map((film) => ({
      label: film.name,
      value: film.id,
    }));

    return compare;
  };

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };

  filter = async () => {
    this.setState({ filtering: true });
    const { product_id } = this.state;
    filterAttributes({ product_id }).then(
      (res) => {
        this.setState({
          filtering: false,
          attributes: res.attributes,
        });
      },
      (error) => {
        console.log(error);
        this.setState({ filtering: false });
      }
    );
  };

  onSaveSales = async (e) => {
    e.preventDefault();
    await toast.dismiss();
    const {quantity_sold,validation } = this.state;
    await this.setState({
      validation: {
        ...validation,
        //product_attributes_values:product_attributes_values !== undefined && product_attributes_values.length !== 0,
      
        quantity_sold: quantity_sold !== '' && quantity_sold !== undefined,
      },
    });
    if (Object.values(this.state.validation).every(Boolean)) {
      this.saveSales();
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

  saveSales = () => {
    this.setState({ saving: true });

    const {quantity_sold,stock} =this.state;
    let data = new FormData();
    data.set("quantity_sold", quantity_sold);
    return axios
      .post(
        `${settings.API_URL}sales_order/${stock.id}`,
        data,
        {
          headers: authHeader(),
        },
        authService.handleResponse
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ saving: false, edit: false });
        this.props.saved();
        this.props.toggle();
        this.showToast("Sales order created");
        //return <Redirect to={{ pathname: '/auth/login', state: { from: props.location } }} />
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errorMessage: err.response.data,
          show: true,
        });
        if (this.state.errorMessage) {
          this.showToast("Server error");
        }
        this.setState({ saving: false });
      });
  };

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  filterProduct = (inputValue) => {
    return this.state.products.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  filterSupplier = (inputValue) => {
    return this.state.suppliers.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  filterBranches = (inputValue) => {
    return this.state.branches.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterProduct(inputValue));
    }, 1000);
  };

  loadSuppliers = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterSupplier(inputValue));
    }, 1000);
  };

  loadBranches = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterBranches(inputValue));
    }, 1000);
  };

  onChange2 = (e, state) => {
    this.setState({ [state]: e });
  };

  handleChange = (event) => {
    const { value, name } = event.target;
    const { product_attributes_values } = this.state;
    this.setState({
      product_attributes_values: {
        ...product_attributes_values,
        [name]: value,
      },
    });
  };
  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    this.setState({ inputValue });
    return inputValue;
  };
  selectQuantity=()=>{
      const {stock_quantity,quantity_sold}=this.state.stock;
    let quantity=stock_quantity-quantity_sold;
    let text = [];
    for (let i = 1; i <= quantity; i++) {
      //return text += "The number is " + i + "<br>";
      text.push(<option key={i}>{i}</option>);

    }
    return text;
    
  }
  render() {
    const { addSales, products, toggle } = this.props;
    const { loading, suppliers,branches,edit, stock, saving, attributes, validation, filtering } =this.state;
    return (
      <>
        <Modal
          className="modal-dialog modal-dialog-centered"
          isOpen={addSales != null}
          toggle={() => !loading && !saving && toggle}
          style={{ maxWidth: 700 }}
        >
          {loading && <SpinDiv text={"Saving..."} />}
          <div className="modal-header" style={{ padding: "1rem" }}>
            <div className="btn-toolbar mb-2 mb-md-0">
                <h3 className="modal-title" id="exampleModalLabel">
                Add Stock to sales
                </h3>
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
                {saving && <SpinDiv text={"Saving..."} />}
                <Col md={12} className="mb-3">
                  <Row>
                    <Col md={9}>
                      
                    </Col> 
                  </Row>
                  <Row>
                    <Col md={12}>
                    <Form.Group className="mb-2">
                    <Form.Label>Category</Form.Label>

                    <Form.Select
                      id="state"
                      required
                      onChange={async (e) => {
                        await this.onChange(e.target.value, "quantity_sold");
                      }}
                      style={{
                        marginRight: 10,
                        width: "100%",
                      }}
                    >
                      <option value="">select qunatity</option>
                      {this.selectQuantity()}
                     
                    </Form.Select>
                  </Form.Group>
                  
                      
                    </Col>
                  </Row>
                </Col>
                
                
                <div className="mt-3">
                  <div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      onClick={this.onSaveSales}
                    >
                      save
                    </Button>
                  </div>
                </div>
              </Row>
            </Card.Body>
          </Card>
        </Modal>
      </>
    );
  }
}

export default AddSales;
