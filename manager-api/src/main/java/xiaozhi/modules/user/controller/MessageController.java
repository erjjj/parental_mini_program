package xiaozhi.modules.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xiaozhi.modules.user.dto.MessageDTO;
import xiaozhi.modules.user.entity.MessageEntity;
import xiaozhi.modules.user.service.MessageService;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "消息管理")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    @Operation(summary = "保存消息")
    public boolean saveMessage(@RequestBody MessageDTO message) {
        return messageService.saveMessage(message);
    }

    @GetMapping
    @Operation(summary = "获取消息列表")
    public IPage<MessageDTO> listMessages(
            @RequestParam(value = "userId") String userId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        LambdaQueryWrapper<MessageEntity> query = Wrappers.lambdaQuery();
        if (userId != null) {
            query.eq(MessageEntity::getUserId, userId);
        }
        query.orderByDesc(MessageEntity::getCreateDate);
        return messageService.listMessages(Page.of(page, size), query);
    }
}