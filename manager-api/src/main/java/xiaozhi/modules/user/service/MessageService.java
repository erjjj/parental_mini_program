package xiaozhi.modules.user.service;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import xiaozhi.modules.user.dto.MessageDTO;
import xiaozhi.modules.user.entity.MessageEntity;
import xiaozhi.modules.user.mapper.MessageMapper;

@Service
public class MessageService extends ServiceImpl<MessageMapper, MessageEntity> {

    public boolean saveMessage(MessageDTO messageDTO) {
        MessageEntity entity = JSONUtil.parseObj(messageDTO).toBean(MessageEntity.class);
        return save(entity);
    }

    public IPage<MessageDTO> listMessages(IPage<MessageEntity> page, Wrapper<MessageEntity> query) {
        IPage<MessageEntity> result = super.page(page, query);
        // 将result 转换成IPage<MessageDTO>
        // 这里使用了 Hutool 的 JSONUtil 来进行转换
        return result.convert(entity ->
                JSONUtil.parseObj(entity).toBean(MessageDTO.class)
        );
    }
}
