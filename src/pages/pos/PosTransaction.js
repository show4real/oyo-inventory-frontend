import React, { Component } from "react";
import { Input, Media } from "reactstrap";
import {getPosTransactions} from "../../services/posOrderService";
import { toast } from "react-toastify";
import Cart from "./Cart";
import moment from "moment";
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
import SpinDiv from "../components/SpinDiv";
import 'antd/dist/antd.css';
import { Pagination } from 'antd';
import ReactDatetime from "react-datetime";
import TransactionDetail from "./TransactionDetail";

export class PosTransaction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      page: 1,
      rows: 10,
      loading: false,
      order: "",
      close:false,
      products:[],
      users:[],
      user:'',
      total:0,
      pos_sales:[],
      total_sales:0,
      fromdate: moment().startOf('month'),
      todate: moment().endOf('day'),
      u: JSON.parse(localStorage.getItem("user")),
   
     
    };
  
  }

  componentDidMount() {
    this.getPosTransactions();
   
  }
 

  showToast = (msg) => {
    toast(<div style={{ padding: 20, color: "success" }}>{msg}</div>);
  };
  getPosTransactions = () => {

    const { page, rows, order, todate, fromdate, search, user, products } = this.state;
    this.setState({ loading: true });
    getPosTransactions({ page, rows,fromdate, todate, order,user, search }).then(
      (res) => {
        console.log(res);
        this.setState({
          loading: false,
          pos_sales: res.pos_sales.data,
          users:res.users,
          total: res.pos_sales.total,
          total_sales:res.total_sales
        });
      },
      (error) => {
        this.setState({ loading: false, });
      }
    );
  };

  

  totalSales() {
    const { total_sales } = this.state;
   
    return this.formatCurrency(total_sales);
  }

  

  

  toggleFilter = () => {
    this.setState({ showFilter: !this.state.showFilter });
  };

  onPage = async (page,rows) => {
    await this.setState({page,rows});
    await this.getPosTransactions();
  }
 

  
  handleChange = async (value) => {
      console.log(value);
    this.setState({
      value:value,
      order:value.value
      
    });
    this.getPosTransactions();
  };

  onFilter = async (e, filter) => {
    await this.setState({ [filter]: e });
    await this.getPosTransactions();
  };

 
  formatCurrency(x){
    if(x!==null && x!==0 && x!== undefined){
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `\u20a6${parts.join(".")}`;
    }
    return '0';
  }

  toggleViewTransaction = (transaction_id) => {
    
    this.setState({ transaction_id });
    
  };

  

 

  onChange = (e, state) => {
    this.setState({ [state]: e });
  };

  render() {
    const {
     
      pos_sales,
      users,
      user,
      u,
      page,
      close,
      rows,
      search,
      loading,
      order,
      products,
      showFilter,
      total,
      fromdate, todate,
      transaction_id
    } = this.state;
    const unique_transaction = Array.from(pos_sales.reduce((a, o) => a.set(o.transaction_id, o), new Map()).values());
   
    return (
      <>
       {transaction_id && (
          <TransactionDetail
            saved={this.getPosTransactions} 
            transaction_id={transaction_id}
            toggle={() => this.setState({ transaction_id: false })}

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
                  <Breadcrumb.Item href="#transactions">Transactions</Breadcrumb.Item>
                </Breadcrumb>
              </div>
              <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                  
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
     
                <Col md={2}>
                    <h6>Transactions  ({unique_transaction.length})</h6>
                </Col>
                <Col md={2}>
                    
                    <ReactDatetime
                        value={fromdate}
                        dateFormat={'MMM D, YYYY'}
                        closeOnSelect
                        onChange={e=>this.onFilter(e, 'fromdate')}
                        inputProps={{
                          required: true,
                          className: 'form-control date-filter'
                        }}
                        isValidDate={(current)=>{return (current.isBefore(todate)||current.isSame(todate))&&current.isBefore(moment());}}
                        timeFormat={false}
                    />       
                </Col>
             
                <Col md={2}>
                    <ReactDatetime
                    value={todate}
                    dateFormat={'MMM D, YYYY'}
                    closeOnSelect
                    onChange={e=>this.onFilter(e, 'todate')}
                    inputProps={{
                        required: true,
                        className: 'form-control date-filter'
                    }}
                    isValidDate={(current)=>{return (current.isAfter(fromdate)||current.isSame(fromdate))&&current.isBefore(moment());}}
                    timeFormat={false}
                    />
                </Col>
          <Col lg="1">
            {!showFilter && (
              <div style={{ display: "flex" }}>
                <ButtonGroup>
                <Button
                  color="warning"
                  onClick={this.toggleFilter}
                  size="sm"
                  style={{ marginRight: 10 }}
                >
                  Filter
                </Button>
                
                </ButtonGroup>

              </div>
            )}
          </Col>
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
                    this.getPosTransactions();
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
                onClick={this.getPosTransactions}
              >
                <i className="fa fa-search" />
              </Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
                <div style={{fontSize:"18px",paddingTop:"20px",color:"red",
                paddingLeft:"10px",fontWeight:"bold"}}>
                Total Sold: {this.totalSales()}
          
                </div>
            </Col>
          {showFilter && (
            <div
              style={{
                height: 50,
                borderTop: "0.5px solid #e9ecef",
                padding: "0 0 0 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                overflowX: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 10, fontSize: 14, fontWeight:'bold' }}>
                  Filter By Channel:{" "}
                </span>
                <Form.Select
                  value={order}
                  type="select"
                  style={{ marginRight: 10, width: "fit-content" }}
                  onChange={(e) => this.onFilter(e.target.value, "order")}
                >
                  <option value="">Filter By: Channel </option>
                  <option value="pos_order">POS sales</option>
                  <option value="sales_order">Internal Sales</option>
                </Form.Select>
              </div>
              {u.admin === 1 && <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 10, fontSize: 14, fontWeight:'bold' }}>
                  Filter By User:{" "}
                </span>
                <Form.Select
                  value={user}
                  type="select"
                  style={{ marginRight: 10, width: "fit-content" }}
                  onChange={(e) => this.onFilter(e.target.value, "user")}
                >
                  <option value="">Filtr by User</option>
                  {users.map((p, index) => (
                    <option value={p.id} key={p}>
                      {p.firstname + ' '+ p.lastname}
                    </option>
                  ))}
                  
                  
                </Form.Select>
              </div> }
              
              <Button
                color="warning"
                onClick={this.toggleFilter}
                size="sm"
                style={{ marginRight: 10 }}
              >
                Hide Filters
              </Button>
            </div>
          )}
        </Row>

        <Card border="light" className="shadow-sm mb-4">
          <Row>
            
          </Row>
          <Card.Body className="pb-0">
            <Table
              responsive
              className="table-centered table-nowrap rounded mb-0"
            >
              <thead className="thead-light">
                <tr>
                  <th className="border-0">Cashier Name</th>
                  <th className="border-0">Transaction ID</th>
                  <th className="border-0">Channel</th>
                  <th className="border-0">Transaction Date</th>

                </tr>
              </thead>
              <tbody>
                {unique_transaction.map((transaction, key) => {
                 
                  return (
                    <tr key={key} style={{fontWeight:"bold",textTransform:"capitalize"}}>
                      <td>{transaction.cashier_name}</td>
                      <td>{transaction.transaction_id}</td>
                      <td>{transaction.channel}</td>
                      <td>{moment(transaction.created_at).format('MMM DD YYYY')}</td>
                      <td><Button variant="outline-primary" size="sm" 
                            onClick={() => this.toggleViewTransaction(transaction.transaction_id)}
                            >
                            View Transaction
                       </Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Row>
              <Col md={12} style={{fontWeight:"bold",paddingTop:3}}>
              {pos_sales.length<1&&
                <div style={{color: '#ccc', alignSelf: 'center', padding: 10, fontSize: 13}}>
                  <i className="fa fa-ban" style={{marginRight: 5}}/>
                  No Transaction found
                </div>}
              {pos_sales.length > 0 && <Pagination
                   showSizeChanger
                   defaultCurrent={6}
                  total={total}
                  showTotal={total => `Total ${total} pos_sales`}
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

export default PosTransaction;
