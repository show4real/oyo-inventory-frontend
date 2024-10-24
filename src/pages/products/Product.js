import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CardHeader,

  //UncontrolledTooltip,
  Media,
  Input,
} from "reactstrap";
import {
  faAngleDown,
  faAngleUp,
  faCheck,
  faCog,
  faHome,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
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
import {addProduct, deleteProduct, getProducts } from "../../services/productService";
import SpinDiv from "../components/SpinDiv";
import { getcategories } from "../../services/categoryService";
import AddProduct from "./AddProduct";
import AddCategories from "./AddCategories";
// import AddBrands from "./AddBrands";
import moment from "moment";
import 'antd/dist/antd.css';
import { Pagination } from 'antd';
import DeleteProduct from "./DeleteProduct";
import { throttle, debounce } from "../debounce"

export class Product extends Component {
  constructor(props) {
     
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      products: [],
      total: 0,
      total_cart:0,
      cartItem:[],
      categories:[],
      // brands:[],
      //brand:'',
      cat:'',
      br:'',
      category:'',

    };
    this.cartItem = JSON.parse(localStorage.getItem("cart"));
    this.setState({ cartItem: this.cartItem });
    this.searchDebounced = debounce(this.searchProducts, 500);
    this.searchThrottled = throttle(this.searchProducts, 500);
  }

  componentDidMount() {
    this.searchProducts();
    this.cartItem = localStorage.removeItem("cart");
  }

  handleSearch = event => {
    this.setState({ search: event.target.value }, () => {
      if(this.state.search < 5){
        this.searchThrottled(this.state.search);
      }else{
        this.searchDebounced(this.state.search);
      }
    
    });
  };
  

  onPage = async (page,rows) => {
    await this.setState({page,rows});
    await this.searchProducts();
  }

  getCategories = () => {
    //this.setState({ loading: true });
    getcategories().then(
      
      (res) => {

        this.setState({
          categories:res.categories.data,
          loading:false
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
  //       console.log(res);
  //       this.setState({
  //         brands:res.brands.data,
  //       });
  //     },
  //     (error) => {
  //       this.setState({ loading: false });
  //     }
  //   );
  // };

  

  

  searchProducts = () => {
    const { page, rows, search, category,cat,br,brand,products } = this.state;
    this.setState({ loading: false });
    getProducts({ page, rows,category,brand, search, products }).then(
      (res) => {
          const newProducts = res.products.data.map(item => ({
              id: item.id,
              name:item.name,
              description: item.description,
              status:item.status,
              created_at:item.created_at,
              updated_at:item.updated_at,
              brand_name:item.brand_name,
              category_name:item.category_name,
          }));
          
        this.setState({
          products: newProducts,
          //categories: res.categories,
          //brands: res.brands,
          page: res.products.current_page,
          total: res.products.total,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  
  toggleFilter = (e) => {
    this.setState({ cat: 'hello',showFilter: !this.state.showFilter },() => {
      console.log(this.state.cat)
      this.getCategories();
    });
   
  

  }

  onFilter = async (e, filter) => {
    console.log(e);
    await this.setState({[filter]: e});
    await this.searchProducts();
  }


  toggleCart = (cartCheckout) => {
    this.setState({ cartCheckout });
  };

  toggleAddProduct=()=>{
    this.setState({addProduct:!this.state.addProduct});
  }

  toggleDeleteProduct=(deleteP)=>{
    this.setState({deleteP});
  }

  toggleAddCategory=()=>{
    this.setState({addCategories:!this.state.addCategories});
  }

  // toggleAddBrands=()=>{
  //   this.setState({addBrands:!this.state.addBrands});
  // }
  

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  render() {
    const { 
      products,
      categories,
      // brands, 
      brand,
      category,
      total,
      showFilter,
      addProduct, 
      deleteP,
      addCategories, 
      // addBrands, 
      page, 
      
      rows,
      search, 
      loading, 
      addToCart } = this.state;
    return (
      <>
        
        {addProduct && (
          <AddProduct
            saved={this.searchProducts}
            addProduct={addProduct}
          
            toggle={() => this.setState({ addProduct: null })}
          />
        )}

        {deleteP && (
          <DeleteProduct
            saved={this.searchProducts}
            deleteP={deleteP}
            toggle={() => this.setState({ deleteP: null })}
          />
        )}
        {addCategories && (
          <AddCategories
            saved={this.searchProducts}
            addCategories={addCategories}
            toggle={() => this.setState({ addCategories: null })}
          />
        )}
        {/* {addBrands && (
          <AddBrands
            saved={this.searchProducts}
            addBrands={addBrands}
            toggle={() => this.setState({ addBrands: null })}
          />
        )} */}
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
                  <Button variant="outline-primary" size="sm"  
                
                  onClick={() => this.toggleAddProduct()} 
                  >
                    Add product
                  </Button>
                  
                  <Button variant="outline-primary" size="sm"  
                  onClick={() => {this.props.history.push('/purchase_orders')}}

                  >
                    Stocks
                  </Button>

                  <Button variant="outline-primary" size="sm"  
                
                  onClick={() => this.toggleAddCategory()} 
                  >
                    Create categories
                  </Button>

                  
                  {/* <Button variant="outline-primary" size="sm"  
                
                  onClick={() => this.toggleAddBrands()} 
                  >
                    Create Brands
                  </Button> */}
                  
                 
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="6">
            <h6>Products({total})</h6>
          </Col>
          <Col lg="2">
            {!showFilter && (
              <div style={{ display: "flex", marginTop:10 }}>
                <Button
                  variant="outline-primary"
                  id='filter'
                  onClick={this.toggleFilter}
                  size="sm"
                  style={{ marginRight: 10 }}
                >
                  Filter
                </Button>
              </div>
            )}
          </Col>
          <Col lg="4" className="">
            <div style={{ display: "flex" }}>
              <Input
                placeholder="Search..."
                autoFocus
                id="show"
                value={search}
                style={{ maxHeight: 45, marginRight: 5, marginBottom: 10 }}
                onChange={this.handleSearch}
                
              />
              {/* <Button
                className="btn-icon btn-2"
                color="secondary"
                style={{ maxHeight: 45 }}
                size="sm"
                onClick={this.getProducts}
              >
                <i className="fa fa-search" />
              </Button> */}
            </div>
          </Col>
        </Row>
        <Row>
          {showFilter && (
              <Row>
                <Col md={3} style={{fontWeight:"bold"}}>
                  <Form.Group>
                    <Form.Label>Filter By Category</Form.Label>
                    <Form.Select
                      value={category}
                      type="select"
                      style={{ marginRight: 10, width: "fit-content" }}
                      onChange={(e) => this.onFilter(e.target.value, "category")}
                    >
                    <option value="">Select category</option>
                    {categories.map((p, index) => (
                      <option value={p.id} key={p}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
            

                </Col>
                
                <Col md={2} style={{marginTop:10}}>
                  <Button
                      color="warning"
                      onClick={this.toggleFilter}
                      size="sm"
                      style={{ marginRight: 10 }}
                  >
                  Hide Filters
                </Button>
                </Col>
              </Row>
          )}
        </Row>
        

        <Card border="light" className="shadow-sm mb-4">
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  
                <th className="border-0">S/N</th>
                  <th className="border-0">Product</th>
                  <th className="border-0">category</th>
                  {/* <th className="border-0">Brand</th> */}
                </tr>
              </thead>
              <tbody>
                
                {products.map((product, key) => {
                 
                  return (
                    <tr key={key} style={{fontWeight:"bold",textTransform:"capitalize"}}>
                      <td>{key+1}</td>
                      <td>{product.name}</td>                
                      <td key={key} className="hover-list" to="/" onClick={() => {//console.log('111')
                          this.props.history.push('/products/'+product.id)
                        }}>{product.category_name}</td>
                      {/* <td>{product.brand_name}</td>
                    
                      */}
                      <td>
                        <ButtonGroup>
                        <Button
                          variant="outline-primary"
                          onClick={() => {//console.log('111')
                            this.props.history.push('/products/'+product.id)
                          }}
                          size="sm"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => {//console.log('111')
                            this.toggleDeleteProduct(product)
                          }}            
                          size="sm"
                        >
                          Delete
                        </Button>
                        </ButtonGroup>
                      </td>
                      <td>
                      
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Row>
              <Col md={12} style={{fontWeight:"bold",paddingTop:3}}>
              {products.length<1&&
                <div style={{color: '#ccc', alignSelf: 'center', padding: 10, fontSize: 13}}>
                  <i className="fa fa-ban" style={{marginRight: 5}}/>
                  No Products
                </div>}
              {products.length > 0 && <Pagination
                  showSizeChanger
                  defaultCurrent={6}
                  total={total}
                  showTotal={total => `Total ${total} products`}
                  onChange={this.onPage}
                  pageSize={rows}
                  current={page}
                />}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  }
}

export default Product;
