package com.elitegym.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UpgradeRequiredException extends RuntimeException {

    private final boolean upgradeRequired = true;

    public UpgradeRequiredException(String message) {
        super(message);
    }
}
