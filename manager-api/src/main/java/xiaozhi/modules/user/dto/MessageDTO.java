package xiaozhi.modules.user.dto;

import cn.hutool.json.JSONObject;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "大模型消息传输对象")
public class MessageDTO {

    @Schema(description = "会话ID")
    private String sessionId;

    @Schema(description = "用户ID")
    private String userId;

    @Schema(description = "输入提示词(JSON格式)")
    private JSONObject inputPrompt;

    @Schema(description = "输出响应(JSON格式)")
    private JSONObject outputResponse;

    @Schema(description = "模型类型")
    private String modelType;

    @Schema(description = "模型名称")
    private String modelName;

    @Schema(description = "耗时(毫秒)")
    private Long durationMs;
}
