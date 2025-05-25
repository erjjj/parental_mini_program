package xiaozhi.modules.user.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import xiaozhi.modules.user.entity.MessageEntity;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class MessageMapperTest {

    @Autowired
    private MessageMapper messageMapper;

    @Test
    void testInsertAndSelect() {
        MessageEntity message = new MessageEntity();
        message.setUserId("testUserId");
        message.setSessionId("testUser");
        message.setCreateDate(new Date());
        message.setModelType("testModel");

        int insertCount = messageMapper.insert(message);
        assertEquals(1, insertCount);

        MessageEntity selected = messageMapper.selectById(message.getId());
        assertNotNull(selected);
        assertEquals("testUser", selected.getSessionId());
    }

    @Test
    void testSelectBySessionId() {
        // Insert test data
        MessageEntity message1 = new MessageEntity();
        message1.setUserId("testUserId");
        message1.setSessionId("testUser1");
        message1.setCreateDate(new Date());
        messageMapper.insert(message1);

        MessageEntity message2 = new MessageEntity();
        message2.setUserId("testUser2");
        message2.setSessionId("testUser2");
        message2.setCreateDate(new Date());
        messageMapper.insert(message2);

        // Query by sessionId
        LambdaQueryWrapper<MessageEntity> query = Wrappers.lambdaQuery();
        query.eq(MessageEntity::getSessionId, "testUser1")
                .orderByDesc(MessageEntity::getCreateDate);

        List<MessageEntity> results = messageMapper.selectList(query);
        assertEquals(1, results.size());
        assertEquals("testUser1", results.get(0).getSessionId());
    }

    @Test
    void testPagination() {
        // Insert multiple test records
        for (int i = 0; i < 15; i++) {
            MessageEntity message = new MessageEntity();
            message.setUserId("testUser");
            message.setSessionId("testUser");
            message.setCreateDate(new Date());
            messageMapper.insert(message);
        }

        // Test pagination
        Page<MessageEntity> page = new Page<>(2, 5);
        LambdaQueryWrapper<MessageEntity> query = Wrappers.lambdaQuery();
        query.eq(MessageEntity::getSessionId, "testUser")
                .orderByDesc(MessageEntity::getCreateDate);

        Page<MessageEntity> result = messageMapper.selectPage(page, query);
        assertEquals(15, result.getTotal());
        assertEquals(5, result.getRecords().size());
        assertEquals(2, result.getCurrent());
    }
}
