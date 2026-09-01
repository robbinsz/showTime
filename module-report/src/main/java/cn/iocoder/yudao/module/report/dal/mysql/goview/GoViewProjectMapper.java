package cn.iocoder.yudao.module.report.dal.mysql.goview;

import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.mybatis.core.mapper.BaseMapperX;
import cn.iocoder.yudao.framework.mybatis.core.query.LambdaQueryWrapperX;
import cn.iocoder.yudao.module.report.dal.dataobject.goview.GoViewProjectDO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GoViewProjectMapper extends BaseMapperX<GoViewProjectDO> {

    default PageResult<GoViewProjectDO> selectPage(PageParam reqVO, Long userId, Long deptId, boolean isAdmin) {
        LambdaQueryWrapperX<GoViewProjectDO> wrapper = new LambdaQueryWrapperX<GoViewProjectDO>()
                .orderByDesc(GoViewProjectDO::getId);
        if (isAdmin) {
            // 超级管理员可查看所有部门大屏
            return selectPage(reqVO, wrapper);
        }
        if (userId != null && deptId != null) {
            // 部门用户：可查看/协作自己创建的或本部门归属的大屏
            wrapper.and(w -> w.eq(GoViewProjectDO::getCreator, userId)
                    .or(w2 -> w2.eq(GoViewProjectDO::getDeptId, deptId)));
        } else if (userId != null) {
            wrapper.eq(GoViewProjectDO::getCreator, userId);
        } else if (deptId != null) {
            wrapper.eq(GoViewProjectDO::getDeptId, deptId);
        }
        return selectPage(reqVO, wrapper);
    }

}
