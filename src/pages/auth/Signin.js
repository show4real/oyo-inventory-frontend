import React,{Component} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faEnvelope, faEye, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons";
import { Col, Row, Form, Spinner, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/signin.svg";
import { faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { login} from "../../services/authService";
import  { toast } from "react-toastify";




export class Signin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      error: null,
      show: false,
    };
  }

  onChange = (e, state) => {

    this.setState({ [state]: e });
  };

  isValid = () => {
    const { username, password } = this.state;
    const phone = /^([0]\d{10})$/;
    const email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (
      password != null &&
      password !== "" &&
      (email.test(username.trim()) || phone.test(username.trim()))
    ) {
      return true;
    }
  };
  onSubmit=(e)=>{
    e.preventDefault();
    const { username, password } = this.state;
    console.log(username);

    this.setState({ loading: true });

    login({username,password}).then(
      (v)=>{
        this.setState({ loading: true });
        this.props.history.push("/");
      },
      (error) => {
        this.setState({ loading: false, password: "" });
        toast.dismiss();
        toast.configure({ hideProgressBar: true, closeButton: false });
        toast(
          <div style={{ padding: 20, color: "#EC3237" }}>
            Invalid Username or Password
          </div>
        );
        
      }
    )
  }

  render() {
    const { show, loading, username, password } = this.state;
    return (
      <main>
        <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
          <Container>
            
            <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}>
              <Col xs={12} className="d-flex align-items-center justify-content-center">
                <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">POS INVOICING /INVENTORY SYSTEM </h3>
                  </div>
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Sign in </h3>
                  </div>
                  <Form className="mt-4">
                    <Form.Group id="email" className="mb-4">
                      <Form.Label>Your Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Form.Control autoFocus required type="text" placeholder="Enter email or username" value={username}
                      onChange={(e) =>
                        this.onChange(e.target.value, "username")
                      } />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group>
                      <Form.Group id="password" className="mb-4">
                        <Form.Label>Your Password</Form.Label>
                        <InputGroup>

                          <InputGroup.Text>
                        
                            <FontAwesomeIcon icon={show ? faEyeSlash : faEye } style={{ fontSize: 12, cursor: "pointer" }}
                          onClick={() => this.setState({ show: !show })} />
                            
                          </InputGroup.Text>
                          <Form.Control required type={show ? "text" : "password"} value={password}
                            onChange={(e) =>
                            this.onChange(e.target.value, "password")
                            } placeholder="Password" 
                          />
                        </InputGroup>
                      </Form.Group>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        {/* <Form.Check type="checkbox">
                          <FormCheck.Input id="defaultCheck5" className="me-2" />
                          <FormCheck.Label htmlFor="defaultCheck5" className="mb-0">Remember me</FormCheck.Label>
                        </Form.Check> */}
                        <Card.Link className="small text-end">Lost password?</Card.Link>
                      </div>
                    </Form.Group>
                    <Button variant="primary" disabled={!this.isValid() || loading} type="submit" className="w-100" onClick={this.onSubmit}>
                    {loading ? <Spinner animation="grow" variant="light blue" /> : <span>sign in</span>}
                    </Button>
                  </Form>
                  {/* <div style={{fontWeight:'bold', fontSize:18}}>
                    username:testforall@test.com<br/>
                    password: 123456
                  </div> */}
  
                  {/* <div className="mt-3 mb-4 text-center">
                    <span className="fw-normal">or login with</span>
                  </div>
                  <div className="d-flex justify-content-center my-4">
                    <Button variant="outline-light" className="btn-icon-only btn-pill text-facebook me-2">
                      <FontAwesomeIcon icon={faFacebookF} />
                    </Button>
                    <Button variant="outline-light" className="btn-icon-only btn-pill text-twitter me-2">
                      <FontAwesomeIcon icon={faTwitter} />
                    </Button>
                    <Button variant="outline-light" className="btn-icon-only btn-pil text-dark">
                      <FontAwesomeIcon icon={faGithub} />
                    </Button>
                  </div>
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <span className="fw-normal">
                      Not registered?
                      <Card.Link as={Link} to={Routes.Signup.path} className="fw-bold">
                        {` Create account `}
                      </Card.Link>
                    </span>
                  </div> */}
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
  }
}

export default Signin





