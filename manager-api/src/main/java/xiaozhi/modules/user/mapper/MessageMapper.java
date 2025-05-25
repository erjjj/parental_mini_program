package xiaozhi.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import xiaozhi.modules.user.entity.MessageEntity;

@Mapper
public interface MessageMapper extends BaseMapper<MessageEntity> {
}
