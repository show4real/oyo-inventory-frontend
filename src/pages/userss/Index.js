import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CardHeader,

  //UncontrolledTooltip,
  Media,
  Input,
  Badge,
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
import { getUsers } from "../../services/userService";
import SpinDiv from "../components/SpinDiv";
import AddUser from "./AddUser";
import { addUser } from "../../services/userService";
//import { throttle, debounce } from "throttle-debounce";
import { throttle,debounce } from "../debounce";

export class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      users: [],
      branches:[],
      total: 0,

    };
    this.searchDebounced = debounce(this.searchUsers, 500);
    this.searchThrottled = throttle(this.searchUsers, 500);
  }

  componentDidMount() {
    this.getUsers();

    /*const cartItem = JSON.parse(localStorage.getItem("cart"));
    console.log(cartItem);
    this.setState({ cartItem: cartItem });*/
  }

  getUsers = () => {
    const { page, rows, search, users } = this.state;
    this.setState({ loading: true });
    getUsers({ page, rows, search, users }).then(
      (res) => {
        console.log(res.users.data);
        
        this.setState({
          users: res.users.data,
          page: res.users.current_page,
          branches:res.branches,
          total: res.users.total,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  searchUsers = () => {
    const { page, rows, search, users } = this.state;
    this.setState({ loading: false });
    getUsers({ page, rows, search, users }).then(
      (res) => {
        console.log(res.users.data);
        
        this.setState({
          users: res.users.data,
          page: res.users.current_page,
          branches:res.branches,
          total: res.users.total,
          loading: false,
        });
      },
      (error) => {
        this.setState({ loading: false });
      }
    );
  };

  

  /*toggleAddToCart = (addToCart) => {
    var items = this.state.cartItem === null ? [] : [...this.state.cartItem];
    var item = items.find((item) => item.id === addToCart.id);
    if (item) {
      item.id = addToCart.id;
    } else {
      items.push(addToCart);
    }
    this.setState({ cartItem: items });
    localStorage.setItem("cart", JSON.stringify(items));
  };

  inCart = (cartId) =>{
    let inCartIds=this.state.cartItem;
    
    if(inCartIds !== null){
      var result = inCartIds.map((user, key) => {
        return user.id;
     })
     let validateId=result.includes(cartId);
    
     return validateId;
    }else{
      return false;
    }
    
  }*/

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  
  handleSearch = event => {
    this.setState({ search: event.target.value }, () => {
      if(this.state.search < 5){
        this.searchThrottled(this.state.search);
      }else{
        this.searchDebounced(this.state.search);
      }
    
    });
  };
  

  toggleAddUser = () => {
    this.setState({ addUser: !this.state.addUser });
  };

  render() {
    const { users, total, page, rows, search, loading, addUser,branches } = this.state;
    
    return (
      <>
        {addUser && (
          <AddUser
            saved={this.getUsers}
            branches={branches}
            addUser={addUser}
            toggle={() => this.setState({ addUser: null })}
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
                  <Breadcrumb.Item href="#users">users</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  <Button variant="outline-primary" size="sm" onClick={() => this.toggleAddUser()}>
                    Add User
                  </Button>
                
                </ButtonGroup>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg="8">
          <h5 className="mb-0">Users 
          <span style={{color: '#aaa', fontSize: 14, fontWeight: 'normal'}}> ({total})</span></h5>
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
                onClick={this.getUsers}
              >
                <i className="fa fa-search" />
              </Button> */}
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
                  <th className="border-0">Name</th>
                  <th className="border-0">Email</th>
                  <th className="border-0">Phone</th>

                  <th className="border-0">status</th>
                </tr>
              </thead>
              <tbody>
                
                {users.map((user, key) => {
               
                  return (
                    <tr>
                      <th scope="row">
                        <td>
                        <Media className="align-items-center">
                          <a
                            className="avatar rounded-circle mr-3"
                            href="#p"
                            onClick={(e) => e.preventDefault()}
                          >
                            <img
                              style={{
                                maxHeight: 50,
                                maxWidth: 50,
                                borderRadius: 2,
                              }}
                              alt="..."
                              src={
                                user.picture ||
                                require("../../assets/img/brand/user.jpg")
                              }
                            />
                           
                          </a>
                          </Media>
                        </td>
                          <td><span className="mb-0 text-sm">{user.name}</span></td>
                        
                      </th>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                              {user.status ==1 ?'Active':'Inactive'}
                            </td>
                      
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

export default Index;
