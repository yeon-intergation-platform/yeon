package world.yeon.backend.user_experience.service;

public class ExperienceServiceException extends RuntimeException {
  private final int status;
  private final String code;

  public ExperienceServiceException(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public int status() {
    return status;
  }

  public String code() {
    return code;
  }
}
