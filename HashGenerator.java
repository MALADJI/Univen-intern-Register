import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123: " + encoder.encode("admin123"));
        System.out.println("supervisor123: " + encoder.encode("supervisor123"));
        System.out.println("intern123: " + encoder.encode("intern123"));
    }
}
