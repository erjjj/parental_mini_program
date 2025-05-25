package xiaozhi.modules.user.entity;

import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import xiaozhi.common.entity.BaseEntity;

@Data
@TableName(value = "ai_message", autoResultMap = true)
@Schema(description = "大模型交互消息记录表")
public class MessageEntity extends BaseEntity {


    @Schema(description = "会话ID")
    private String sessionId;

    @Schema(description = "用户ID")
    private String userId;

    @TableField(typeHandler = JacksonTypeHandler.class)
    @Schema(description = "输入提示词(JSON格式)")
    private JSONObject inputPrompt;

    @TableField(typeHandler = JacksonTypeHandler.class)
    @Schema(description = "输出响应(JSON格式)")
    private JSONObject outputResponse;

    @Schema(description = "模型类型")
    private String modelType;

    @Schema(description = "模型名称")
    private String modelName;

    @Schema(description = "耗时(毫秒)")
    private Long durationMs;

    @Schema(description = "状态(0失败 1成功)")
    private Integer status;

    @Schema(description = "错误信息")
    private String errorMsg;
}
