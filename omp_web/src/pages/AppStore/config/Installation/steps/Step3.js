import { Button, Form, Checkbox, Input, Menu, Spin, message } from "antd";
import { useEffect, useRef, useState, useCallback } from "react";
import { SearchOutlined, ExclamationOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import ServiceConfigItem from "../component/ServiceConfigItem";
import { fetchGet, fetchPost } from "@/utils/request";
import { apiRequest } from "@/config/requestApi";
import { handleResponse } from "@/utils/utils";
import {
  getStep3IpDataChangeAction,
  getStep3ErrorInfoChangeAction,
} from "../store/actionsCreators";

const Step3 = ({ setStepNum }) => {
  const dispatch = useDispatch();
  // unique_key: "21e041a9-c9a5-4734-9673-7ed932625d21"
  // 服务的loading
  const [loading, setLoading] = useState(false);

  const [loadingIp, setLoadingIp] = useState(false);

  const uniqueKey = useSelector((state) => state.appStore.uniqueKey);

  // redux中取数据
  const reduxData = useSelector((state) => state.installation.step3Data);

  const errInfo = useSelector((state) => state.installation.step3ErrorData);
  console.log(errInfo["10.0.12.250"]);

  const [checked, setChecked] = useState(false);

  const [serviceConfigform] = Form.useForm();

  const viewHeight = useSelector((state) => state.layouts.viewSize.height);

  // 指定本次安装服务运行用户
  const [runUser, setRunUser] = useState("");

  // 筛选后的ip列表
  const [currentIpList, setCurrentIpList] = useState([]);

  // ip列表中的选中项
  const [checkIp, setCheckIp] = useState("");

  // ip 筛选value
  const [searchIp, setSearchIp] = useState("");

  // ip列表的数据源
  const [ipList, setIpList] = useState([]);

  // const [dataSource, setDataSource] = useState([]);

  // const dataSource = [
  //   {
  //     name: "doucApi",
  //     install_args: [
  //       {
  //         name: "安装目录",
  //         key: "base_dir",
  //         default: "/app/doucApi",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "日志目录",
  //         key: "log_dir",
  //         default: "/logs/doucApi",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "数据目录",
  //         key: "data_dir",
  //         default: "/appData/doucApi",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "启动内存",
  //         key: "memory",
  //         default: "1g",
  //       },
  //       {
  //         name: "数据库",
  //         key: "dbname",
  //         default: "cw_douc",
  //       },
  //       {
  //         name: "安装用户",
  //         key: "run_user",
  //         default: "commonuser",
  //       },
  //       {
  //         name: "kafka_topic名字",
  //         key: "kafka_topic",
  //         default: "cw-logs",
  //       },
  //     ],
  //     ports: [
  //       {
  //         name: "服务端口",
  //         protocol: "TCP",
  //         key: "service_port",
  //         default: "18241",
  //       },
  //       {
  //         name: "metric端口",
  //         protocol: "TCP",
  //         key: "metrics_port",
  //         default: "18241",
  //       },
  //     ],
  //   },
  //   {
  //     name: "doucSso",
  //     install_args: [
  //       {
  //         name: "安装目录",
  //         key: "base_dir",
  //         default: "/app/doucSso",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "日志目录",
  //         key: "log_dir",
  //         default: "/logs/doucSso",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "数据目录",
  //         key: "data_dir",
  //         default: "/appData/doucSso",
  //         dir_key: "{data_path}",
  //       },
  //       {
  //         name: "启动内存",
  //         key: "memory",
  //         default: "1g",
  //       },
  //       {
  //         name: "数据库",
  //         key: "dbname",
  //         default: "cw_douc",
  //       },
  //       {
  //         name: "安装用户",
  //         key: "run_user",
  //         default: "commonuser",
  //       },
  //       {
  //         name: "kafka_topic名字",
  //         key: "kafka_topic",
  //         default: "cw-logs",
  //       },
  //     ],
  //     ports: [
  //       {
  //         name: "服务端口",
  //         protocol: "TCP",
  //         key: "service_port",
  //         default: "18256",
  //       },
  //       {
  //         name: "metric端口",
  //         protocol: "TCP",
  //         key: "metrics_port",
  //         default: "18256",
  //       },
  //     ],
  //   },
  // ];

  function queryIpList() {
    setLoadingIp(true);
    fetchGet(apiRequest.appStore.getInstallHostRange, {
      params: {
        unique_key: uniqueKey,
      },
    })
      .then((res) => {
        handleResponse(res, (res) => {
          setIpList(res.data.data);
          setCurrentIpList(res.data.data);
          setCheckIp(res.data.data[0]);
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoadingIp(false);
      });
  }

  const queryInstallArgsByIp = (ip) => {
    // 如果redux中已经存了当前ip的数据就不再请求直接使用redux中的
    if (reduxData[ip]) {
      return;
    }
    setLoading(true);
    fetchGet(apiRequest.appStore.getInstallArgsByIp, {
      params: {
        unique_key: uniqueKey,
        ip: ip,
      },
    })
      .then((res) => {
        handleResponse(res, (res) => {
          //setDataSource(res.data.data);
          dispatch(
            getStep3IpDataChangeAction({
              [ip]: res.data.data,
            })
          );
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  // 提交前对数据进行处理
  const dataProcessing = (data) => {
    let obj = {};
    ipList.map((ip) => {
      obj[ip] = [];
    });
    console.log(data);
    return {
      ...obj,
      ...data,
    };
  };

  // 有校验失败的信息生成errlist
  const getErrorInfo = (data) => {
    // return {
    //   "10.0.12.243": {
    //     doucAdmin: {
    //       base_dir: "/test/app/jdk 在目标主机 10.0.12.243 上已存在",
    //     },
    //   },
    //   "10.0.12.250": {
    //     gatewayServer: {
    //       base_dir: "/test/app/jdk 在目标主机 10.0.12.250 上已存在",
    //     },
    //   },
    // };
    console.log(data);
    let result = {};
    for (const ip in data) {
      data[ip].map((service) => {
        [...service.install_args, ...service.ports].map((serv) => {
          if (!serv.check_flag) {
            result[ip] = {};
            result[ip][service.name] = {};
            result[ip][service.name][serv.key] = serv.error_msg;
          }
        });
      });
    }
    console.log(result, "result");
    return result;
  };

  // 开始安装操作命令下发
  const createInstallPlan = (queryData) => {
    setLoading(true);
    fetchPost(apiRequest.appStore.createInstallPlan, {
      body: {
        unique_key: uniqueKey,
        run_user: runUser,
        data: queryData,
      },
    })
      .then((res) => {
        //console.log(operateObj[operateAciton])
        handleResponse(res, (res) => {
          if (res.data && res.data.data) {
            if (res.data.is_continue) {
              // 校验通过，跳转，请求服务分布数据并跳转
              setStepNum(3);
            } else {
              message.warn("校验未通过");
              dispatch(
                getStep3ErrorInfoChangeAction(getErrorInfo(res.data.data))
              );

              //reduxDispatch(getStep2ErrorLstChangeAction(res.data.error_lst));
            }
          }
        });
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (checkIp) {
      queryInstallArgsByIp(checkIp);
    }
  }, [checkIp]);

  useEffect(() => {
    // 请求ip数据
    // currentIpList
    queryIpList();
  }, []);

  return (
    <div>
      <div
        style={{
          marginTop: 20,
          backgroundColor: "#fff",
          padding: 10,
          paddingLeft: 30,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: 220 }}>
          <Checkbox
            checked={checked}
            onChange={(e) => {
              if (!e.target.checked) {
                setRunUser("");
              }
              setChecked(e.target.checked);
            }}
          >
            指定本次安装服务运行用户
          </Checkbox>
        </div>

        <Input
          disabled={!checked}
          placeholder="请输入本次安装服务运行用户"
          style={{ width: 300 }}
          value={runUser}
          onChange={(e) => {
            setRunUser(e.target.value);
          }}
        />
      </div>

      <div
        style={{
          marginTop: 15,
          backgroundColor: "#fff",
          display: "flex",
        }}
      >
        <div style={{ width: 240 }}>
          <div
            style={{
              padding: "15px 5px 10px 5px",
            }}
          >
            <Input
              allowClear
              onBlur={() => {
                if (searchIp) {
                  let result = ipList.filter((i) => {
                    return i.includes(searchIp);
                  });
                  setCurrentIpList(result);
                  result.length > 0 && setCheckIp(result[0]);
                } else {
                  setCurrentIpList(ipList);
                  setCheckIp(ipList[0]);
                }
              }}
              value={searchIp}
              onChange={(e) => {
                setSearchIp(e.target.value);
                if (!e.target.value) {
                  setCurrentIpList(ipList);
                  setCheckIp(ipList[0]);
                }
              }}
              onPressEnter={() => {
                if (searchIp) {
                  let result = ipList.filter((i) => {
                    return i.includes(searchIp);
                  });
                  setCurrentIpList(result);
                  result.length > 0 && setCheckIp(result[0]);
                } else {
                  setCurrentIpList(ipList);
                  setCheckIp(ipList[0]);
                }
              }}
              placeholder="搜索IP地址"
              suffix={
                !searchIp && <SearchOutlined style={{ color: "#b6b6b6" }} />
              }
            />
          </div>
          <div
            style={{
              overflowY: "auto",
            }}
          >
            <div
              style={{
                cursor: "pointer",
                borderRight: "0px",
                height: viewHeight - 390,
              }}
            >
              <Spin spinning={loadingIp}>
                {currentIpList.map((item) => {
                  return (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          padding: 5,
                          paddingLeft: 30,
                          flex: 1,
                          color: errInfo[item]
                            ? "red"
                            : checkIp == item
                            ? "#4986f7"
                            : "",
                          backgroundColor: checkIp == item ? "#edf8fe" : "",
                        }}
                        onClick={() => {
                          setCheckIp(item);
                        }}
                      >
                        {item}
                      </div>
                      {errInfo[item] && (
                        <div
                          style={{
                            width: 30,
                            padding: 5,
                            paddingLeft: 0,
                            backgroundColor: checkIp == item ? "#edf8fe" : "",
                            color: "red",
                          }}
                        >
                          <ExclamationOutlined />
                        </div>
                      )}
                    </div>
                  );
                })}
              </Spin>
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            borderLeft: "1px solid #d9d9d9",
            height: viewHeight - 335,
            overflowY: "auto",
          }}
        >
          {!reduxData[checkIp] || reduxData[checkIp].length == 0 ? (
            <Spin spinning={true} tip="数据加载中...">
              <div style={{ width: "100%", height: 300 }}></div>
            </Spin>
          ) : (
            <Form form={serviceConfigform} name="config" labelCol={{ span: 8 }} wrapperCol={{ span: 40 }}>
              {reduxData[checkIp]?.map((item) => {
                return (
                  <ServiceConfigItem
                    ip={checkIp}
                    key={item.name}
                    data={item}
                    form={serviceConfigform}
                    loading={loading}
                  />
                );
              })}
            </Form>
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          backgroundColor: "#fff",
          width: "calc(100% - 230px)",
          bottom: 10,
          padding: "10px 0px",
          display: "flex",
          justifyContent: "space-between",
          paddingRight: 30,
          boxShadow: "0px 0px 10px #999999",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <div style={{ paddingLeft: 20 }}>分布主机数量: {ipList.length}台</div>
        <div>
          <Button
            type="primary"
            onClick={() => {
              setStepNum(1);
            }}
          >
            上一步
          </Button>
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            //disabled={unassignedServices !== 0}
            loading={loading}
            onClick={() => {
              //setStepNum(3);
              //console.log(serviceConfigform.getFieldValue());
              serviceConfigform.validateFields().then(
                (e) => {
                  console.log("不一定成功了", e);
                  createInstallPlan(dataProcessing(reduxData));
                },
                (e) => {
                  console.log("失败了", e);
                }
              );
            }}
          >
            开始安装
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3;
