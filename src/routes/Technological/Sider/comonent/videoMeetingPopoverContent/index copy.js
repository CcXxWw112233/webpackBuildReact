import React, { Component } from 'react'
import indexStyles from './index.less'
import {
    Popover,
    Select,
    Input,
    Mention,
    Button,
    message,
} from 'antd'
import { connect } from 'dva'
import { validateTel } from "@/utils/verify";
import { getCurrentSelectedProjectMembersList } from '@/services/technological/workbench' 
const Option = Select.Option;
const { TextArea } = Input;
const { getMentions, toString, toContentState } = Mention;
const Nav = Mention.Nav;


@connect(({ technological, workbench }) => {
    return {
        projectList:
            technological.datas && technological.datas.currentOrgProjectList
                ? technological.datas.currentOrgProjectList
                : [],
        projectTabCurrentSelectedProject:
            workbench.datas && workbench.datas.projectTabCurrentSelectedProject
                ? workbench.datas.projectTabCurrentSelectedProject
                : "0",
        // currentSelectedProjectMembersList:
        //     workbench.datas && workbench.datas.currentSelectedProjectMembersList
        //         ? workbench.datas.currentSelectedProjectMembersList
        //         : [],
        // currentOrgAllMembers: technological.datas.currentOrgAllMembersList
    };
})
class VideoMeetingPopoverContent extends React.Component {
    state = {
        saveToProject: null,
        meetingTitle: "",
        videoMeetingDefaultSuggesstions: [], //mention 原始数据
        selectedSuggestions: [], //自定义的mention选择列表
        suggestionValue: toContentState(""), //mention的值
        mentionSelectedMember: [], //已经选择的 item,
        selectedMemberTextAreaValue: "",
        videoMeetingPopoverVisible: false,
        currentSelectedProjectMembersList: [], //当前选择项目的项目成员
        currentOrgAllMembers: [], //当前组织的职员
        org_id: '0'
    }

    // 获取项目用户
    getProjectUsers = ({projectId}) => {
        if(!projectId) return
        this.setVideoMeetingDefaultSuggesstionsByBoardUser({board_users: []})
        getCurrentSelectedProjectMembersList({projectId}).then(res => {
            if(res.code == '0') {
                const board_users = res.data
                this.setState({
                    currentSelectedProjectMembersList: board_users,
                    currentOrgAllMembers: board_users
                }, () => {
                    this.setVideoMeetingDefaultSuggesstionsByBoardUser({board_users})
                })
            } else {
                message.error(res.message)
            }
        })
    }

    // 设置mention组件提及列表
    setVideoMeetingDefaultSuggesstionsByBoardUser = ({board_users = []}) => {
        const videoMeetingDefaultSuggesstions = this.handleAssemVideoMeetingDefaultSuggesstions(board_users);
        this.setState({
            selectedSuggestions: videoMeetingDefaultSuggesstions,
            videoMeetingDefaultSuggesstions,
            suggestionValue: toContentState(""), //mention的值
        }, () => {
            // console.log({
            //     videoMeetingDefaultSuggesstions,
            //     suggestionValue: this.state.suggestionValue
            // })
        })
    }

    handleVideoMeetingSaveSelectChange = value => {
        const { projectList = [] } = this.props
        // console.log('ssssssss__',{ value,  projectList})
        this.getProjectUsers({projectId: value})
        this.setState({
            saveToProject: value,
            org_id: !value?'0': projectList.find(item => item.board_id == value).org_id || '0'
        });
    };

    handleVideoMeetingTopicChange = e => {
        this.setState({
            meetingTitle: e.target.value
        });
    };

    handleVideoMeetingMemberChange = value => {
        const { videoMeetingDefaultSuggesstions } = this.state;
        const searchValue = value.toLowerCase();
        const filtered = videoMeetingDefaultSuggesstions.filter(item =>
            item.toLowerCase().includes(searchValue)
        );
        const suggestions = filtered.map(suggestion => (
            <Nav value={suggestion} data={suggestion}>
                <span>{suggestion}</span>
            </Nav>
        ));
        this.setState({
            selectedSuggestions: suggestions
        });
    };
    handleTransMentionSelectedMember = () => {
        const { currentOrgAllMembers } = this.state;
        const { mentionSelectedMember } = this.state;
        //有可能存在 name(mobile) 和 name(email) 的情况
        return mentionSelectedMember.reduce((acc, curr) => {
            const isFindFullNameINCurr = name =>
                currentOrgAllMembers.find(item => item.name === name);
            const isFullNameWithMobleOrEmail = () =>
                curr.endsWith(")") && isFindFullNameINCurr(curr.split("(")[0]);
            if (isFullNameWithMobleOrEmail()) {
                const name = curr.split("(")[0];
                const getUserByFull_name = currentOrgAllMembers.find(
                    item => item.name === name
                );
                const isUserHasMoblie = getUserByFull_name.mobile;
                const isUserHasEmail = getUserByFull_name.email;
                if (isUserHasMoblie || isUserHasEmail) {
                    const mobileOrEmail = isUserHasMoblie
                        ? isUserHasMoblie
                        : isUserHasMoblie;
                    return acc ? acc + "," + mobileOrEmail : mobileOrEmail;
                }
                return acc;
            } else {
                const getUserByFull_name = currentOrgAllMembers.find(
                    item => item.name === curr
                );
                const isUserHasMoblie = getUserByFull_name.mobile;
                const isUserHasEmail = getUserByFull_name.email;
                const mobileOrEmail = isUserHasMoblie
                    ? isUserHasMoblie
                    : isUserHasEmail;
                return acc ? acc + "," + mobileOrEmail : mobileOrEmail;
            }
        }, "");
    };
    handleTransMentionSelectedOtherMembersMobileString = () => {
        const { selectedMemberTextAreaValue } = this.state;

        //去除空格
        const trimSpace = str => {
            return str.replace(/\s+/g, "");
        };
        //去除换行

        const trimLineBack = str => {
            return str.replace(/<\/?.+?>/g, "").replace(/[\r\n]/g, "");
        };

        const trimSpaceAndLineBackArr = trimLineBack(
            trimSpace(selectedMemberTextAreaValue)
        )
            .replace(/；/g, ";")
            .split(";")
            .map(item => item.trim())
            .filter(item => item);
        const isEachMobileValid = arr => arr.every(item => validateTel(item));
        if (!isEachMobileValid(trimSpaceAndLineBackArr)) {
            return "error";
        } else {
            return trimSpaceAndLineBackArr.reduce((acc, curr) => {
                return acc ? acc + "," + curr : curr;
            }, "");
        }
    };
    openWinNiNewTabWithATag = url => {
        const aTag = document.createElement("a");
        aTag.href = url;
        aTag.target = "_blank";
        document.querySelector("body").appendChild(aTag);
        aTag.click();
        aTag.parentNode.removeChild(aTag);
    };
    handleVideoMeetingSubmit = () => {
        const { dispatch } = this.props;
        const { meetingTitle, saveToProject, org_id } = this.state;
        const mentionSelectedMembersMobileOrEmailString = this.handleTransMentionSelectedMember();
        const mentionSelectedOtherMembersMobileString = this.handleTransMentionSelectedOtherMembersMobileString();
        if (mentionSelectedOtherMembersMobileString === "error") {
            message.error("组织外成员手机号格式有误，请检查");
            return;
        }
        const mergedMeetingMemberStr = [
            mentionSelectedMembersMobileOrEmailString,
            mentionSelectedOtherMembersMobileString
        ].reduce((acc, curr) => {
            return acc ? (curr ? acc + "," + curr : acc) : curr;
        }, "");
        if (!mergedMeetingMemberStr || !meetingTitle) {
            message.error("必须有【会议主题】和【参会人员】");
            return;
        }

        const data = {
            _organization_id: org_id,
            board_id: saveToProject,
            flag: 2,
            rela_id: saveToProject,
            topic: meetingTitle,
            user_for: mergedMeetingMemberStr
        };

        Promise.resolve(
            dispatch({
                type: "technological/initiateVideoMeeting",
                payload: data
            })
        ).then(res => {
            if (res.code === "0") {
                const { start_url } = res.data;
                message.success("发起会议成功");
                this.openWinNiNewTabWithATag(start_url);
                this.setState(
                    {
                        videoMeetingPopoverVisible: false
                    },
                    () => {
                        this.initVideoMeetingPopover();
                    }
                );
            } else if (res.code === "1") {
                message.error(res.message);
                this.setState(
                    {
                        videoMeetingPopoverVisible: false
                    },
                    () => {
                        this.initVideoMeetingPopover();
                    }
                );
            } else {
                message.error("发起会议失败");
            }
        });
    };
    handleVideoMeetingPopoverVisibleChange = flag => {
        this.setState(
            {
                videoMeetingPopoverVisible: flag
            },
            () => {
                if (flag === false) {
                    this.initVideoMeetingPopover();
                }
            }
        );
    };
    initVideoMeetingPopover = () => {
        this.setState({
            // saveToProject: null,
            meetingTitle: "",
            // videoMeetingDefaultSuggesstions: [], //mention 原始数据
            // selectedSuggestions: [], //自定义的mention选择列表
            suggestionValue: toContentState(""), //mention的值
            mentionSelectedMember: [], //已经选择的 item,
            selectedMemberTextAreaValue: ""
        });
    };
    getInfoFromLocalStorage = item => {
        try {
            const userInfo = localStorage.getItem(item)
            return JSON.parse(userInfo)
        } catch (e) {
            message.error('从 Cookie 中获取用户信息失败, 当发起视频会议的时候')
        }
    }
    getCurrentUserNameThenSetMeetingTitle = () => {
        const currentUser = this.getInfoFromLocalStorage("userInfo");
        if (currentUser) {
            const meetingTitle = `${currentUser.name}发起的会议`;
            this.setState({
                meetingTitle
            });
        }
    };
    handleAssemVideoMeetingDefaultSuggesstions = (orgList = []) => {
        return orgList.reduce((acc, curr) => {
            const isHasRepeatedNameItem =
                orgList.filter(item => item.name === curr.name).length >= 2;
            //如果列表中有重复的名称成员存在，那么附加手机号或者邮箱
            //形式： name(mobile|email)
            if (isHasRepeatedNameItem) {
                const item = `${curr.name}(${
                    curr.mobile ? curr.mobile : curr.email
                    })`;
                return [...acc, item];
            }
            return [...acc, curr.name];
        }, []);
    };
    getVideoMeetingDefaultSuggesstions = key => {
        const { dispatch, projectTabCurrentSelectedProject } = this.props;
        const hasMemberInPropKey = () =>
            !!this.props[key] && this.props[key].length;
        Promise.resolve(hasMemberInPropKey())
            .then(flag => {
                // if (!flag) {
                //     if (key === "currentSelectedProjectMembersList") {
                //         return dispatch({
                //             type: "workbench/fetchCurrentSelectedProjectMembersList",
                //             payload: { projectId: projectTabCurrentSelectedProject }
                //         });
                //     }
                //     return dispatch({
                //         type: "workbench/fetchCurrentOrgAllMembers",
                //         payload: {}
                //     });
                // }
            })
            .then(() => {
                if (key === "currentSelectedProjectMembersList") {
                    const { currentSelectedProjectMembersList } = this.state;
                    if (
                        currentSelectedProjectMembersList &&
                        currentSelectedProjectMembersList.length
                    ) {
                        const videoMeetingDefaultSuggesstions = this.handleAssemVideoMeetingDefaultSuggesstions(
                            currentSelectedProjectMembersList
                        );
                        this.setState({
                            saveToProject:
                                projectTabCurrentSelectedProject === "0"
                                    ? null
                                    : projectTabCurrentSelectedProject,
                            videoMeetingDefaultSuggesstions
                        });
                    } else {
                        this.setState({
                            saveToProject:
                                projectTabCurrentSelectedProject === "0"
                                    ? null
                                    : projectTabCurrentSelectedProject,
                            videoMeetingDefaultSuggesstions: []
                        });
                    }
                } else {
                    const { currentOrgAllMembers } = this.state;
                    if (currentOrgAllMembers && currentOrgAllMembers.length) {
                        const videoMeetingDefaultSuggesstions = this.handleAssemVideoMeetingDefaultSuggesstions(
                            currentOrgAllMembers
                        );
                        this.setState({
                            saveToProject:
                                projectTabCurrentSelectedProject === "0"
                                    ? null
                                    : projectTabCurrentSelectedProject,
                            videoMeetingDefaultSuggesstions
                        });
                    } else {
                        this.setState({
                            saveToProject:
                                projectTabCurrentSelectedProject === "0"
                                    ? null
                                    : projectTabCurrentSelectedProject,
                            videoMeetingDefaultSuggesstions: []
                        });
                    }
                }
            });
    };
    getCurrentSelectedProjectAndShouldMentionMember = () => {
        // const { projectTabCurrentSelectedProject } = this.props;
        this.getVideoMeetingDefaultSuggesstions("currentOrgAllMembers");
        // const hasSelectedProject = () => projectTabCurrentSelectedProject !== "0";

        //如果已经选择过具体的项目
        // if (hasSelectedProject()) {
        //   this.getVideoMeetingDefaultSuggesstions(
        //     "currentSelectedProjectMembersList"
        //   );
        // } else {
        //   this.getVideoMeetingDefaultSuggesstions("currentOrgAllMembers");
        // }
    };
    handleShowVideoMeeting = () => {
        this.getCurrentUserNameThenSetMeetingTitle();
        this.getCurrentSelectedProjectAndShouldMentionMember();
    };
    handleVideoMeetingMemberSelect = (suggestion, data) => {
        const { mentionSelectedMember } = this.state;
        const isSuggestionInMentionSelectedMemeber = () =>
            mentionSelectedMember.find(item => item === suggestion);
        if (!isSuggestionInMentionSelectedMemeber()) {
            this.setState(
                state => {
                    return {
                        mentionSelectedMember: [...state.mentionSelectedMember, suggestion]
                    };
                },
                () => {
                    // console.log(
                    //   this.state.mentionSelectedMember,
                    //   "mmmmmmmmmmmmmmmmmmmmmmm"
                    // );
                }
            );
        }
    };
    filterHasDeletedMentionSelectedMember = oriStr => {
        const { mentionSelectedMember } = this.state;
        const shouldExistMentionSelectedMember = mentionSelectedMember.filter(
            item => oriStr.includes("@" + item)
        );
        if (
            shouldExistMentionSelectedMember.length !== mentionSelectedMember.length
        ) {
            this.setState({
                mentionSelectedMember: shouldExistMentionSelectedMember
            });
        }
    };
    getProjectPermission = (permissionType, board_id) => {
        const userBoardPermissions = this.getInfoFromLocalStorage('userBoardPermissions')
        if (!userBoardPermissions || !userBoardPermissions.length) {
            return false
        }
        const isFindedBoard = userBoardPermissions.find(board => board.board_id === board_id)
        if (!isFindedBoard) return false
        const { permissions = [] } = isFindedBoard
        return !!permissions.find(permission => permission.code === permissionType && permission.type === '1')
    }
    filterProjectWhichCurrentUserHasEditPermission = (projectList = []) => {
        return projectList.filter(({ board_id }) => this.getProjectPermission('project:team:board:edit', board_id))
    }
    handleVideoMeetingValueChange = value => {
        this.filterHasDeletedMentionSelectedMember(toString(value));
        this.setState({
            suggestionValue: value
        });
    };
    handleValidVideoMeetingMembers = value => {
        return value;
    };
    selectedMemberTextAreaValueChange = e => {
        this.setState({
            selectedMemberTextAreaValue: e.target.value
        });
    };
    handleToggleVideoMeetingPopover = e => {
        //需要重置项目标题
        if (e) e.stopPropagation();
        this.setState(state => {
            const { videoMeetingPopoverVisible } = state;
            return {
                videoMeetingPopoverVisible: !videoMeetingPopoverVisible
            };
        });
    };

    renderPopover = () => {
        const {
            saveToProject,
            meetingTitle,
            selectedSuggestions,
            suggestionValue,
            selectedMemberTextAreaValue,
            videoMeetingPopoverVisible,
        } = this.state;
        let { projectList } = this.props;

        //过滤出来当前用户有编辑权限的项目
        projectList = this.filterProjectWhichCurrentUserHasEditPermission(projectList)

        const videoMeetingPopoverContent_ = (
            <div>
                {videoMeetingPopoverVisible && (
                    <div className={indexStyles.videoMeeting__wrapper}>
                        <div className={indexStyles.videoMeeting__topic}>
                            <p className={indexStyles.videoMeeting__topic_title}>会议主题:</p>
                            <div className={indexStyles.videoMeeting__topic_content}>
                                <span className={indexStyles.videoMeeting__topic_content_save}>
                                    <Select
                                        defaultValue={saveToProject}
                                        onChange={this.handleVideoMeetingSaveSelectChange}
                                        style={{ width: "140px" }}
                                    >
                                        <Option value={null}>不存入项目</Option>
                                        {projectList.length !== 0 &&
                                            projectList.map(project => (
                                                <Option value={project.board_id} key={project.board_id}>
                                                    {project.board_name}
                                                </Option>
                                            ))}
                                    </Select>
                                </span>
                                <span className={indexStyles.videoMeeting__topic_content_title}>
                                    <Input
                                        value={meetingTitle}
                                        onChange={this.handleVideoMeetingTopicChange}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className={indexStyles.videoMeeting__memberNote}>
                            <p className={indexStyles.videoMeeting__memberNote_title}>
                                通知参会人：
                            </p>
                            <div className={indexStyles.videoMeeting__memberNote_content}>
                                <div
                                    className={
                                        indexStyles.videoMeeting__memberNote_content_mention
                                    }
                                >
                                    {saveToProject && (
                                        <Mention
                                            style={{ width: "100%", height: "56px" }}
                                            placeholder="使用@符号查找该项目内成员"
                                            suggestions={selectedSuggestions}
                                            multiLines
                                            onSearchChange={this.handleVideoMeetingMemberChange}
                                            placement="top"
                                            onSelect={this.handleVideoMeetingMemberSelect}
                                            value={suggestionValue}
                                            onChange={this.handleVideoMeetingValueChange}
                                        />
                                    )}

                                </div>
                                <div
                                    className={
                                        indexStyles.videoMeeting__memberNote_content_textarea
                                    }
                                >
                                    <TextArea
                                        placeholder="直接列举外部参会人的手机号，多号码请用“;”区分"
                                        autosize={{ minRows: 2, maxRows: 4 }}
                                        value={selectedMemberTextAreaValue}
                                        onChange={this.selectedMemberTextAreaValueChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className={indexStyles.videoMeeting__prompt}>
                            点击发起会议后即自动发送通知
                        </p>
                        <div className={indexStyles.videoMeeting__submitBtn}>
                            <Button type="primary" onClick={this.handleVideoMeetingSubmit}>
                                发起会议
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
        return videoMeetingPopoverContent_
    }

    render() {
        const { videoMeetingPopoverVisible } = this.state
        return (
            <Popover
                visible={videoMeetingPopoverVisible}
                placement="leftBottom"
                content={
                    this.renderPopover()
                }
                onVisibleChange={this.handleVideoMeetingPopoverVisibleChange}
                trigger="click"
            >
                <div
                    className={indexStyles.videoMeeting__icon}
                    onMouseEnter={this.handleShowVideoMeeting}
                    onClick={this.handleToggleVideoMeetingPopover}
                />
            </Popover>
        )
    }
}

export default VideoMeetingPopoverContent