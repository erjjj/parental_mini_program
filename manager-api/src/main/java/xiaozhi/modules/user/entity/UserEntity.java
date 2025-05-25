package xiaozhi.modules.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 用户（c端用户）
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("ai_user")
@Schema(description = "设备信息")
public class UserEntity {
    @TableId(type = IdType.ASSIGN_UUID)
    @Schema(description = "ID")
    private String id;

    @Schema(description = "用户ID")
    private String userId;
}
