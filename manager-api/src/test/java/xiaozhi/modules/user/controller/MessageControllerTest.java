package xiaozhi.modules.user.controller;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import xiaozhi.modules.user.dto.MessageDTO;
import xiaozhi.modules.user.entity.MessageEntity;
import xiaozhi.modules.user.service.MessageService;

import java.util.Collections;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MessageControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MessageService messageService;

    @InjectMocks
    private MessageController messageController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(messageController).build();
    }

    @Test
    void saveMessage_ShouldReturnTrue_WhenSaveSuccess() throws Exception {
        MessageDTO message = new MessageDTO();
        message.setUserId("user123");

        when(messageService.save(any(MessageEntity.class))).thenReturn(true);

        mockMvc.perform(post("/api/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(JSONUtil.toJsonStr(message)))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void listMessages_ShouldReturnPage_WhenUserIdProvided() throws Exception {
        MessageEntity message = new MessageEntity();
        message.setUserId("user123");
        message.setCreateDate(new Date());

        Page<MessageEntity> page = new Page<>();
        page.setRecords(Collections.singletonList(message));
        page.setTotal(1);

        when(messageService.listMessages(any(Page.class), any())).thenReturn(page);

        mockMvc.perform(get("/api/messages")
                .param("userId", "user123")
                .param("page", "1")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.records[0].userId").value("user123"))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void listMessages_ShouldReturnPage_WithDefaultPagination() throws Exception {
        MessageEntity message = new MessageEntity();
        message.setUserId("user123");
        message.setCreateDate(new Date());

        Page<MessageEntity> page = new Page<>();
        page.setRecords(Collections.singletonList(message));
        page.setTotal(1);

        when(messageService.listMessages(any(Page.class), any())).thenReturn(page);

        mockMvc.perform(get("/api/messages")
                .param("userId", "user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.records[0].userId").value("user123"))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.current").value(1));
    }
}
