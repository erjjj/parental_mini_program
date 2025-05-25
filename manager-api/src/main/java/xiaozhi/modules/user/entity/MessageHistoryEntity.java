package xiaozhi.modules.user.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 用户交互历史
 */
@Data
public class MessageHistoryEntity {
    @Schema(description = "关联用户ID")
    private Long userId;

}
