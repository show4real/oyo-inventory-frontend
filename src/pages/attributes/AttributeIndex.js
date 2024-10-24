import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "reactstrap";
import {
  getAllPurchaseOrders,
  addPurchaseorder,
} from "../../services/purchaseOrderService";
import { toast } from "react-toastify";
import {
  Col,
  Row,
  Card,
  Table,
  Button,
  ButtonGroup,
  Breadcrumb,
  Form,
} from "@themesberg/react-bootstrap";

import Profile3 from "../../assets/img/team/profile-picture-3.jpg";
import SpinDiv from "../components/SpinDiv";
import axios from "axios";
import settings from "../../services/settings";
import { authHeader } from "../../services/authHeader";
import { authService } from "../../services/authService";
import { counter } from "@fortawesome/fontawesome-svg-core";
import { Cart } from "../products/Cart";
import { AsyncPaginate } from "react-select-async-paginate";
import AddAttribute from "./AddAttribute";
import { getattributes } from "../../services/attributeService";
import AsyncSelect from "react-select/async";

export class AttributeIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      attributes: [],
      products:[],
      product_id:"",
      value:"",
      total: 0,
      total_cart: 0,
    }
  }

  componentDidMount() {
    const { initialProducts } = this.state;
    this.setState({ products: { ...initialProducts } });
  }
  

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getProducts = () => {

    const { page, rows, search,products } = this.state;
    this.setState({ loading: true });
    getattributes({ page, rows, search }).then(
      (res) => {
        this.setState({
          loading: false,
          products:res.products,
          initialProducts: { ...res.products },
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    this.setState({ inputValue });
    return inputValue;
  };
  

  
  filterProduct = (inputValue) => {
    const { page, rows, search,products } = this.state;
    console.log(products)
     return products.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase()))
    /**/
  };

  loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(this.filterProduct(inputValue));
    }, 1000);
  };

  onChange2 = (e, state) => {
    this.setState({ [state]: e });
  };


  toggleFilter = () => {
    this.setState({ showFilter: !this.state.showFilter });
  };
  
  
  onFilter = async (e, filter) => {
    console.log(filter);
    await this.setState({ [filter]: e });
    await this.getAttributes();
  };

  filter = async () => {
    this.setState({ filtering: true });
    const { product_id } = this.state;
    getattributes({ product_id }).then(
      (res) => {
        this.setState({
          filtering: false,
          attributes: res.attributes.data,
        });
      },
      (error) => {
        console.log(error);
        this.setState({ filtering: false });
      }
    );
  };

  
  toggleAddAttribute = () => {
    this.setState({ addAttribute: !this.state.addAttribute });
  };
  
  onChange = (e, state) => {
    this.setState({ [state]: e });
  };
  allproduct=(products)=>{
      return products;
  }

  render() {
    const {
      attributes,
      total,
      addAttribute,
      rows,
      products,
      search,
      loading,
      filtering
    } = this.state;
    return (
      <>
      
        {addAttribute && (
          <AddAttribute
            saved={this.getAttributes}
            addAttribute={addAttribute}
            toggle={() => this.setState({ addAttribute: null })}
          />
        )}

       

        {loading && <SpinDiv text={"Loading..."} />}
        <Row style={{}}>
          <Col lg="12">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
              <div className="d-block mb-4 mb-md-0">
                <Breadcrumb
                  listProps={{
                    className: " breadcrumb-text-dark text-primary",
                  }}
                >
                  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="#products">products</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => this.toggleAddAttribute()}
                  >
                    Create attributes
                  </Button>
                  <Button variant="outline-primary" size="sm"  
                  onClick={() => {this.props.history.push('/products')}}

                  >
                    Products
                  </Button>
                 
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="7">
            <h6>Attributes({total})</h6>
           
          </Col>
          <Row>
                    <Col md={9}>
                      <Form.Group className="mb-2">
                        <Form.Label>Select Product</Form.Label>
                        
                        <AsyncSelect
                          cacheOptions
                          defaultOptions
                          disabled={filtering}
                          loadOptions={this.loadOptions}
                          onInputChange={this.handleInputChange}
                          onChange={async (property, value) => {
                            console.log(property);
                            await this.setState({
                              product_id: property.value,
                              selectedTitle: property.label,
                            });
                            await this.filter();
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
          <Col lg="4" className="">
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Search..."
                id="show"
                style={{ maxHeight: 45, marginRight: 5, marginBottom: 10 }}
                value={search}
                onChange={(e) => this.onChange(e.target.value, "search")}
                autoFocus
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    this.getAttributes();
                    this.setState({
                      search: "",
                    });
                  }
                }}
              />
              <Button
                className="btn-icon btn-2"
                color="secondary"
                style={{ maxHeight: 45 }}
                size="sm"
                onClick={this.getAttributes}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        
        <Card border="light" className="shadow-sm mb-4">
          
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Attribute</th>
                </tr>
              </thead>
              <tbody>
            
                {filtering ? "loading...":attributes.map((attribute, key) => {
                  return (
                    <tr key={key}>
                      <td>{attribute.name}</td>
                      <td>
                        <Button color="primary" size="sm" onClick={() => {//console.log('111')
                            this.props.history.push('/attribute/'+attribute.id)
                          }}>
                          view/edit
                        </Button>
                      </td>
                      {/*<td>
                        <Button
                          color="primary"
                          onClick={() => this.toggleAddToCart(purchase_order)}
                          size="sm"
                        >
                          {alreadyAdded
                            ? "cart" + ` (${purchase_order.quantity})`
                            : "Add to Cart"}
                        </Button>
                          </td>*/}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default AttributeIndex;
