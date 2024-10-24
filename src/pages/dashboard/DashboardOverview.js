import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faChartLine, faCloudUploadAlt, faObjectGroup, faPlus, faRocket, faTasks, faTruck, faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Dropdown, ButtonGroup } from '@themesberg/react-bootstrap';

import { CounterWidget, CircleChartWidget, BarChartWidget, TeamMembersWidget, ProgressTrackWidget, RankingWidget, SalesValueWidget, SalesValueWidgetPhone, AcquisitionWidget } from "../../components/Widgets";
import { getDashboardDetails } from '../../services/userService';
import SpinDiv from "../components/SpinDiv";
import { faProductHunt } from '@fortawesome/free-brands-svg-icons';
import moment from "moment";
export class DashboardOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
     users:[],
     supplier_count:0,
     branch_count:0,
     product_count:0,
     fromdate: moment().startOf('month'),
     todate: moment().endOf('day'),
     total_sales:0,
     total_purchases:0,
     user:JSON.parse(localStorage.getItem('user'))

    
    };
    

  }
  componentDidMount(){
    this.getDashboardDetails();
  }
  logOut = () =>{ 
    localStorage.removeItem("user");
   localStorage.removeItem('token');
   localStorage.clear();
   let path = '/auth/sign-in'; 
   this.props.history.push(path);

 }

 getDashboardDetails = () => {


  this.setState({ loading: true });
 const {fromdate, todate}= this.state;
  getDashboardDetails({fromdate, todate}).then(
   
    (res) => {
      console.log(res)
      this.setState({
        loading: false,
        users: res.users,
        product_count: res.product_count,
        supplier_count: res.supplier_count,
        branch_count: res.branch_count,
        total_sales:res.total_sales,
        total_purchases:res.total_purchases
      });
    },
    (error) => {
      this.setState({ loading: false, });
    }
  );
};
formatCurrency(x){
  if(x!==null && x!==0 && x!== undefined){
    const parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `\u20a6${parts.join(".")}`;
  }
  return '0';
}

  render() {
    const {loading, users, user,fromdate, todate, supplier_count,total_purchases, product_count, total_sales, branch_count}= this.state;
    return (
      <>
        {loading && <SpinDiv text={"Loading..."} />}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
       
      <h3>{user.branch_name} Branch</h3>

       <ButtonGroup>
         <Button variant="outline-danger"  onClick={() => this.logOut()} size="sm">Sign Out</Button>
         {/* <Button variant="outline-primary" size="sm">Export</Button> */}
       </ButtonGroup>
     </div>
        {/* <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
          <Dropdown className="btn-toolbar">
            <Dropdown.Toggle as={Button} variant="primary" size="sm" className="me-2">
              <FontAwesomeIcon icon={faPlus} className="me-2" />New Task
            </Dropdown.Toggle>
            <Dropdown.Menu className="dashboard-dropdown dropdown-menu-left mt-2">
              <Dropdown.Item className="fw-bold">
                <FontAwesomeIcon icon={faTasks} className="me-2" /> New Task
              </Dropdown.Item>
              <Dropdown.Item className="fw-bold">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" /> Upload Files
              </Dropdown.Item>
              <Dropdown.Item className="fw-bold">
                <FontAwesomeIcon icon={faUserShield} className="me-2" /> Preview Security
              </Dropdown.Item>
  
              <Dropdown.Divider />
  
              <Dropdown.Item className="fw-bold">
                <FontAwesomeIcon icon={faRocket} className="text-danger me-2" /> Upgrade to Pro
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
  
          <ButtonGroup>
          <Button variant="outline-danger"  onClick={() => this.logOut()} size="sm">Sign Out</Button>
          <Button variant="outline-primary" size="sm">Export</Button>
        </ButtonGroup>
        </div> */}
  
        <Row className="justify-content-md-center">
          {/* <Col xs={12} className="mb-4 d-none d-sm-block">
            <SalesValueWidget
              title="Sales Value"
              value="10,567"
              percentage={10.57}
            />
          </Col> */}
          {/* <Col xs={12} className="mb-4 d-sm-none">
            <SalesValueWidgetPhone
              title="Sales Value"
              value="10,567"
              percentage={10.57}
            />
          </Col> */}
          <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Users"
              title={users.length}
              icon={faUsers}
              iconColor="shape-secondary"
            />
          </Col>
          <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Branches"
              title={branch_count}
              percentage={28.4}
              icon={faObjectGroup}
              iconColor="shape-tertiary"
            />
          </Col>
  
          <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Products"
              title={product_count}
              percentage={28.4}
              icon={faProductHunt}
              iconColor="shape-tertiary"
            />
          </Col>
          {user.admin == 1 && <>
            <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Suppliers"
              title={supplier_count}
              period="Feb 1 - Apr 1"
              percentage={28.4}
              icon={faTruck}
              iconColor="shape-tertiary"
            />
          </Col>
          <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Total Purchase Order"
              title={this.formatCurrency(total_purchases)}
              icon={faCashRegister}
              iconColor="shape-tertiary"
            />
          </Col>
          <Col xs={12} sm={6} xl={4} className="mb-4">
            <CounterWidget
              category="Sales"
              title={this.formatCurrency(total_sales)}
              period= {moment(fromdate).format('MMM DD YYYY')+'-'+moment(todate).format('MMM DD YYYY')}
             
              icon={faCashRegister}
              iconColor="shape-tertiary"
            />
          </Col>

          </>}
          
        
  
         
        </Row>
  
        
      </>
    );
  
  }
}

export default DashboardOverview
